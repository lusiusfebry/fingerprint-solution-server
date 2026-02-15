import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as XLSX from 'xlsx';
import { AttendanceLog } from '../../database/entities/attendance-log.entity';
import { Employee } from '../../database/entities/employee.entity';
import { Device } from '../../database/entities/device.entity';
import { IAttendanceLog } from '../devices/interfaces/device-response.interface';
import { AttendanceLogFilterDto } from './dto/attendance-log-filter.dto';
import { AttendanceLogResponseDto } from './dto/attendance-log-response.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { ExportFilterDto } from './dto/export-filter.dto';
import { DevicesGateway } from '../devices/devices.gateway';

import { AttendanceCalculationFilterDto } from './dto/attendance-calculation-filter.dto';
import { CalculatedAttendanceDto } from './dto/calculated-attendance.dto';
import { AttendanceSummaryReportDto } from './dto/attendance-summary-report.dto';

export interface IAttendanceLogWithDevice extends IAttendanceLog {
  device_id: string;
  time?: string;
  timestamp?: Date;
}

@Injectable()
export class AttendanceLogsService {
  private readonly logger = new Logger(AttendanceLogsService.name);

  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly devicesGateway: DevicesGateway,
  ) {}

  private mapVerifyType(type: number): string {
    const types: Record<number, string> = {
      0: 'Password',
      1: 'Fingerprint',
      2: 'Card',
      15: 'Face',
    };
    return types[type] || 'Other';
  }

  private mapInOutMode(mode: number): string {
    const modes: Record<number, string> = {
      0: 'Check In',
      1: 'Check Out',
      2: 'Break Out',
      3: 'Break In',
      4: 'Overtime In',
      5: 'Overtime Out',
    };
    return modes[mode] || 'General';
  }

  private transformToDto(log: AttendanceLog): AttendanceLogResponseDto {
    return {
      id: log.id,
      employee_id: log.employee_id,
      employee_nik: log.employee?.nik || '',
      employee_nama: log.employee?.nama || '',
      employee_departemen: log.employee?.departemen || '',
      device_id: log.device_id,
      device_name: log.device?.name || '',
      device_location: log.device?.location || '',
      timestamp: log.timestamp,
      verify_type: log.verify_type,
      verify_type_label: this.mapVerifyType(log.verify_type),
      in_out_mode: log.in_out_mode,
      in_out_mode_label: this.mapInOutMode(log.in_out_mode),
      created_at: log.created_at,
    };
  }

  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  private calculateTimeDifference(time1: Date, time2: Date): number {
    return Math.floor((time2.getTime() - time1.getTime()) / (1000 * 60)); // difference in minutes
  }

  private isWorkDay(date: Date, hariKerja: number[]): boolean {
    return hariKerja.includes(date.getDay());
  }

  private getCheckInOut(logs: AttendanceLog[]): {
    checkIn: Date | null;
    checkOut: Date | null;
  } {
    if (logs.length === 0) return { checkIn: null, checkOut: null };

    // Sort logs by time
    logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const checkIn = logs[0].timestamp;
    const checkOut = logs.length > 1 ? logs[logs.length - 1].timestamp : null;

    return { checkIn, checkOut };
  }

  async saveLogs(logs: IAttendanceLogWithDevice[]): Promise<void> {
    try {
      this.logger.log(`Processing ${logs.length} logs...`);

      const uniquePins = [...new Set(logs.map((log) => log.pin))];
      const employees = await this.employeeRepository.find({
        where: uniquePins.map((pin) => ({ nik: pin })),
      });
      const employeeMap = new Map(employees.map((emp) => [emp.nik, emp.id]));

      const logsToSave: AttendanceLog[] = [];

      for (const log of logs) {
        // Comment 2: Call validateLog() for each incoming log
        const validation = await this.validateLog(log);
        if (!validation.valid) {
          this.logger.warn(
            `Log ignored for PIN ${log.pin}: ${validation.errors.join(', ')}`,
          );
          continue;
        }

        const employeeId = employeeMap.get(log.pin);
        if (!employeeId) {
          this.logger.warn(`Log ignored: No employee found for PIN ${log.pin}`);
          continue;
        }

        const timestamp =
          log.timestamp || new Date(log.dateTime || log.time || '');

        const newLog = this.attendanceLogRepository.create({
          employee_id: employeeId,
          device_id: log.device_id,
          timestamp: timestamp,
          verify_type: parseInt(log.verified) || 0,
          in_out_mode: parseInt(log.status) || 0,
        });

        logsToSave.push(newLog);
      }

      if (logsToSave.length > 0) {
        const result = await this.attendanceLogRepository.upsert(logsToSave, {
          conflictPaths: ['employee_id', 'timestamp'],
          skipUpdateIfNoValuesChanged: true,
        });

        // Emit real-time updates for identifiers inserted/updated
        // Since upsert doesn't return full objects easily, we fetch saved logs
        // or just emit the ones we attempted to save (assuming mostly new/updated)
        // For efficiency in high volume, maybe only emit if it's the current date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const log of logsToSave) {
          if (log.timestamp >= today) {
            // Find employee info for DTO
            const emp = employees.find((e) => e.id === log.employee_id);
            const dto = this.transformToDto({
              ...log,
              employee: emp,
            } as AttendanceLog);
            this.devicesGateway.emitAttendanceLog(dto);
          }
        }

        this.logger.log(
          `Upserted logs. Affected: ${result.identifiers.length}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to save logs: ${(error as Error).message}`);
      throw error;
    }
  }

  async findAll(filter: AttendanceLogFilterDto) {
    const {
      startDate,
      endDate,
      employeeId,
      deviceId,
      verifyType,
      inOutMode,
      page = 1,
      limit = 50,
      sortOrder = 'DESC',
    } = filter;

    // Comment 3: Whitelist sortable fields
    let { sortBy = 'timestamp' } = filter;
    const allowedSortFields = [
      'timestamp',
      'created_at',
      'verify_type',
      'in_out_mode',
    ];
    if (!allowedSortFields.includes(sortBy)) {
      this.logger.warn(
        `Invalid sortBy field: ${sortBy}. Defaulting to timestamp.`,
      );
      sortBy = 'timestamp';
    }

    const query = this.attendanceLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.employee', 'employee')
      .leftJoinAndSelect('log.device', 'device');

    if (startDate) {
      query.andWhere('log.timestamp >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('log.timestamp <= :endDate', { endDate });
    }
    if (employeeId) {
      query.andWhere('log.employee_id = :employeeId', { employeeId });
    }
    if (deviceId) {
      query.andWhere('log.device_id = :deviceId', { deviceId });
    }
    if (verifyType !== undefined) {
      query.andWhere('log.verify_type = :verifyType', { verifyType });
    }
    if (inOutMode !== undefined) {
      query.andWhere('log.in_out_mode = :inOutMode', { inOutMode });
    }
    if (filter.search) {
      query.andWhere(
        '(employee.nama ILIKE :search OR employee.nik ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }
    if (filter.department && filter.department !== 'all') {
      query.andWhere('employee.departemen ILIKE :department', {
        department: `%${filter.department}%`,
      });
    }
    if (filter.device && filter.device !== 'all') {
      // Logic for device can be by name or ID (if it's a UUID)
      query.andWhere('(device.name ILIKE :device OR device.id = :deviceId)', {
        device: `%${filter.device}%`,
        deviceId: filter.device,
      });
    }
    if (filter.status && filter.status !== 'all') {
      // Status in entity is 'present' | 'late' | 'absent' but log doesn't have it directly.
      // Usually status is calculated. For now let's just ignore it or assume a field exists.
      // Looking at transformToDto, status isn't there.
      // I'll skip status filtering for now as it needs complex logic or a saved field.
    }

    query.orderBy(`log.${sortBy}`, sortOrder);

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = items.map((item) => this.transformToDto(item));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<AttendanceLogResponseDto> {
    const log = await this.attendanceLogRepository.findOne({
      where: { id },
      relations: ['employee', 'device'],
    });

    if (!log) {
      throw new NotFoundException(`Attendance log with ID ${id} not found`);
    }

    return this.transformToDto(log);
  }

  async getSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AttendanceSummaryDto> {
    // Comment 1: Ensure consistent date window for all aggregates
    const start = startDate || new Date();
    if (!startDate) start.setHours(0, 0, 0, 0);

    const end = endDate || new Date(start);
    if (!endDate) {
      end.setDate(end.getDate() + 1);
      end.setHours(0, 0, 0, 0);
    }

    const totalLogs = await this.attendanceLogRepository.count({
      where: { timestamp: Between(start, end) },
    });
    const todayLogs = totalLogs; // In this context, todayLogs effectively becomes date-range logs

    const uniqueEmployeesTodayResult = await this.attendanceLogRepository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.employee_id)', 'count')
      .where('log.timestamp BETWEEN :start AND :end', { start, end })
      .getRawOne<{ count: string }>();
    const uniqueEmployeesToday = uniqueEmployeesTodayResult
      ? parseInt(uniqueEmployeesTodayResult.count)
      : 0;

    const byDevice = await this.attendanceLogRepository
      .createQueryBuilder('log')
      .leftJoin('log.device', 'device')
      .select('log.device_id', 'deviceId')
      .addSelect('device.name', 'deviceName')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.timestamp BETWEEN :start AND :end', { start, end })
      .groupBy('log.device_id')
      .addGroupBy('device.name')
      .getRawMany<{ deviceId: string; deviceName: string; count: string }>();

    const byVerifyTypeRaw = await this.attendanceLogRepository
      .createQueryBuilder('log')
      .select('log.verify_type', 'type')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.timestamp BETWEEN :start AND :end', { start, end })
      .groupBy('log.verify_type')
      .getRawMany<{ type: number; count: string }>();

    const byVerifyType = byVerifyTypeRaw.map((v) => ({
      type: v.type,
      label: this.mapVerifyType(v.type),
      count: parseInt(v.count) || 0,
    }));

    const recentItems = await this.attendanceLogRepository.find({
      where: { timestamp: Between(start, end) },
      order: { timestamp: 'DESC' },
      take: 10,
      relations: ['employee', 'device'],
    });

    const recentLogs = recentItems.map((item) => this.transformToDto(item));

    return {
      totalLogs,
      todayLogs,
      uniqueEmployeesToday,
      byDevice: byDevice.map((d) => ({
        deviceId: d.deviceId,
        deviceName: d.deviceName,
        count: parseInt(d.count) || 0,
      })),
      byVerifyType,
      recentLogs,
      dateRange: { start, end },
    };
  }

  async exportToExcel(filter: ExportFilterDto): Promise<Buffer> {
    // Get data without pagination
    const result = await this.findAll({ ...filter, limit: 1000000 });
    const data = result.data;

    const workbook = XLSX.utils.book_new();
    const worksheetData = data.map((log, index) => ({
      No: index + 1,
      NIK: log.employee_nik,
      Nama: log.employee_nama,
      Departemen: log.employee_departemen,
      Device: log.device_name,
      Lokasi: log.device_location,
      Waktu: log.timestamp.toLocaleString('id-ID'),
      'Tipe Verifikasi': log.verify_type_label,
      'Mode In/Out': log.in_out_mode_label,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Logs');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  async validateLog(
    log: IAttendanceLogWithDevice,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const now = new Date();

    const employee = await this.employeeRepository.findOne({
      where: { nik: log.pin },
    });
    if (!employee) {
      errors.push(`Karyawan dengan NIK ${log.pin} tidak ditemukan`);
    }

    const device = await this.deviceRepository.findOne({
      where: { id: log.device_id },
    });
    if (!device) {
      errors.push(`Device dengan ID ${log.device_id} tidak ditemukan`);
    }

    const timestamp = new Date(log.dateTime || log.time || '');
    if (isNaN(timestamp.getTime())) {
      errors.push('Format waktu tidak valid');
    } else if (timestamp > now) {
      errors.push('Waktu tidak boleh di masa depan');
    }

    const verifyType = parseInt(log.verified);
    if (![0, 1, 2, 15].includes(verifyType)) {
      errors.push('Tipe verifikasi tidak valid');
    }

    const inOutMode = parseInt(log.status);
    if (inOutMode < 0 || inOutMode > 5) {
      errors.push('Mode In/Out tidak valid');
    }

    return { valid: errors.length === 0, errors };
  }

  async checkDuplicate(employeeId: string, timestamp: Date): Promise<boolean> {
    const count = await this.attendanceLogRepository.count({
      where: { employee_id: employeeId, timestamp },
    });
    return count > 0;
  }
  async calculateAttendance(filter: AttendanceCalculationFilterDto): Promise<{
    data: CalculatedAttendanceDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      employee_id,
      start_date,
      end_date,
      shift_id,
      status_kehadiran,
      page = 1,
      limit = 50,
    } = filter;

    const start = new Date(start_date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(end_date);
    end.setHours(23, 59, 59, 999);

    const employeesQuery = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.employee_shifts', 'es') // Load all history
      .leftJoinAndSelect('es.shift', 'shift');

    if (employee_id) {
      employeesQuery.where('employee.id = :employeeId', {
        employeeId: employee_id,
      });
    }

    if (shift_id) {
      employeesQuery.andWhere('shift.id = :shiftId', { shiftId: shift_id });
    }

    const employees = await employeesQuery.getMany();

    const result: CalculatedAttendanceDto[] = [];
    const loopDate = new Date(start);

    while (loopDate <= end) {
      const dateStr = loopDate.toISOString().split('T')[0];
      const nextDay = new Date(loopDate);
      nextDay.setDate(nextDay.getDate() + 1);

      for (const employee of employees) {
        const relevantShiftAssignment = employee.employee_shifts.find((es) => {
          const startDate = new Date(es.tanggal_mulai);
          const endDate = es.tanggal_selesai
            ? new Date(es.tanggal_selesai)
            : null;
          return startDate <= loopDate && (!endDate || endDate >= loopDate);
        });

        const shift = relevantShiftAssignment?.shift;

        if (shift_id && shift?.id !== shift_id) continue;

        const isWorkingDay = shift
          ? this.isWorkDay(loopDate, shift.hari_kerja)
          : false;

        let searchStart = loopDate;
        let searchEnd = nextDay;

        if (shift && isWorkingDay) {
          const shiftMasuk = this.parseTime(shift.jam_masuk);
          const shiftPulang = this.parseTime(shift.jam_pulang);

          const shiftMasukDate = new Date(loopDate);
          shiftMasukDate.setHours(shiftMasuk.hours, shiftMasuk.minutes, 0, 0);

          const shiftPulangDate = new Date(loopDate);
          shiftPulangDate.setHours(
            shiftPulang.hours,
            shiftPulang.minutes,
            0,
            0,
          );

          if (shiftPulangDate < shiftMasukDate) {
            shiftPulangDate.setDate(shiftPulangDate.getDate() + 1);
          }

          searchStart = new Date(shiftMasukDate.getTime() - 4 * 60 * 60 * 1000);
          searchEnd = new Date(shiftPulangDate.getTime() + 6 * 60 * 60 * 1000);
        }

        const logs = await this.attendanceLogRepository.find({
          where: {
            employee_id: employee.id,
            timestamp: Between(searchStart, searchEnd),
          },
          order: { timestamp: 'ASC' },
        });

        const { checkIn, checkOut } = this.getCheckInOut(logs);

        let status: 'hadir' | 'terlambat' | 'alpha' | 'libur' = 'alpha';
        let durasi_terlambat = 0;
        let jam_kerja = 0;
        let keterangan: string | null = null;

        if (!shift) {
          status = 'libur';
          keterangan = 'Tidak ada shift';
        } else if (!isWorkingDay) {
          status = 'libur';
        } else {
          if (checkIn) {
            const shiftMasuk = this.parseTime(shift.jam_masuk);
            const shiftMasukDate = new Date(loopDate);
            shiftMasukDate.setHours(shiftMasuk.hours, shiftMasuk.minutes, 0, 0);

            const toleranceLimit = new Date(
              shiftMasukDate.getTime() + shift.toleransi_terlambat * 60000,
            );

            if (checkIn > toleranceLimit) {
              status = 'terlambat';
              durasi_terlambat = this.calculateTimeDifference(
                shiftMasukDate,
                checkIn,
              );
            } else {
              status = 'hadir';
            }

            if (checkOut) {
              jam_kerja = parseFloat(
                (this.calculateTimeDifference(checkIn, checkOut) / 60).toFixed(
                  2,
                ),
              );
            }
          } else {
            status = 'alpha';
          }
        }

        if (status_kehadiran && status !== status_kehadiran) continue;

        result.push({
          employee_id: employee.id,
          employee_nik: employee.nik,
          employee_nama: employee.nama,
          employee_departemen: employee.departemen || '-',
          shift_id: shift?.id || null,
          shift_nama: shift?.nama || null,
          jam_masuk_shift: shift?.jam_masuk || null,
          jam_pulang_shift: shift?.jam_pulang || null,
          tanggal: dateStr,
          waktu_check_in: checkIn,
          waktu_check_out: checkOut,
          status_kehadiran: status,
          durasi_terlambat: durasi_terlambat > 0 ? durasi_terlambat : null,
          jam_kerja: jam_kerja > 0 ? jam_kerja : null,
          keterangan,
        });
      }

      loopDate.setDate(loopDate.getDate() + 1);
    }

    const total = result.length;
    const paginatedData = result.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAttendanceSummary(
    filter: AttendanceCalculationFilterDto,
  ): Promise<AttendanceSummaryReportDto[]> {
    const { data } = await this.calculateAttendance({
      ...filter,
      page: 1,
      limit: 100000,
    });

    const grouped = new Map<string, CalculatedAttendanceDto[]>();
    data.forEach((item) => {
      const existing = grouped.get(item.employee_id) || [];
      existing.push(item);
      grouped.set(item.employee_id, existing);
    });

    const reports: AttendanceSummaryReportDto[] = [];

    grouped.forEach((items, empId) => {
      const first = items[0];

      const total_hari_kerja = items.filter(
        (i) => i.status_kehadiran !== 'libur' && i.shift_id,
      ).length;
      const total_hadir = items.filter(
        (i) =>
          i.status_kehadiran === 'hadir' || i.status_kehadiran === 'terlambat',
      ).length;
      const total_terlambat = items.filter(
        (i) => i.status_kehadiran === 'terlambat',
      ).length;
      const total_alpha = items.filter(
        (i) => i.status_kehadiran === 'alpha',
      ).length;
      const total_durasi_terlambat = items.reduce(
        (sum, i) => sum + (i.durasi_terlambat || 0),
        0,
      );
      const total_jam_kerja = items.reduce(
        (sum, i) => sum + (i.jam_kerja || 0),
        0,
      );
      const persentase_kehadiran =
        total_hari_kerja > 0
          ? parseFloat(((total_hadir / total_hari_kerja) * 100).toFixed(2))
          : 0;

      reports.push({
        employee_id: empId,
        employee_nik: first.employee_nik || '',
        employee_nama: first.employee_nama || '',
        periode: {
          start_date: filter.start_date,
          end_date: filter.end_date,
        },
        total_hari_kerja,
        total_hadir,
        total_terlambat,
        total_alpha,
        total_durasi_terlambat,
        total_jam_kerja,
        persentase_kehadiran,
      });
    });

    return reports;
  }
}
