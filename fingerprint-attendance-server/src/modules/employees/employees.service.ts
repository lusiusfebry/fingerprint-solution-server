import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
import { Device } from '../../database/entities/device.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadFingerprintDto } from './dto/upload-fingerprint.dto';
import { FingerprintTemplatesService } from '../fingerprint-templates/fingerprint-templates.service';
import { FingerprintDeviceService } from '../devices/services/fingerprint-device.service';
import * as XLSX from 'xlsx';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly fingerprintTemplatesService: FingerprintTemplatesService,
    private readonly fingerprintDeviceService: FingerprintDeviceService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check duplicate NIK
    const existing = await this.employeeRepository.findOne({
      where: { nik: createEmployeeDto.nik },
    });

    if (existing) {
      throw new BadRequestException(
        `Karyawan dengan NIK ${createEmployeeDto.nik} sudah ada`,
      );
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    const saved = await this.employeeRepository.save(employee);

    // Auto-push to all active devices
    if (saved.status === 'aktif') {
      await this.pushToAllDevices(saved);
    }

    return saved;
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['fingerprint_templates'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['fingerprint_templates'],
    });

    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check NIK duplicate if changed
    if (updateEmployeeDto.nik && updateEmployeeDto.nik !== employee.nik) {
      const existing = await this.employeeRepository.findOne({
        where: { nik: updateEmployeeDto.nik },
      });
      if (existing) {
        throw new BadRequestException(
          `NIK ${updateEmployeeDto.nik} sudah digunakan`,
        );
      }
    }

    const oldStatus = employee.status;
    Object.assign(employee, updateEmployeeDto);
    const updated = await this.employeeRepository.save(employee);

    // Auto-update to all devices
    if (updated.status === 'aktif') {
      await this.pushToAllDevices(updated);
    } else if (oldStatus === 'aktif' && updated.status === 'nonaktif') {
      // Auto-delete from all devices when status changed to nonaktif
      await this.deleteFromAllDevices(updated.nik);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);

    // Delete from all devices first
    await this.deleteFromAllDevices(employee.nik);

    // Delete fingerprint templates
    await this.fingerprintTemplatesService.deleteByEmployee(id);

    // Delete employee
    await this.employeeRepository.remove(employee);
  }

  async uploadFingerprint(
    id: string,
    uploadDto: UploadFingerprintDto,
  ): Promise<any> {
    const employee = await this.findOne(id);

    // Save template to database
    const template = await this.fingerprintTemplatesService.create(
      id,
      uploadDto.finger_index,
      uploadDto.template_data,
    );

    // Push template to all active devices
    if (employee.status === 'aktif') {
      await this.pushFingerprintToAllDevices(
        employee.nik,
        uploadDto.finger_index,
        uploadDto.template_data,
        uploadDto.device_id,
      );
    }

    return {
      success: true,
      message: 'Template sidik jari berhasil diupload',
      data: template,
    };
  }

  async importFromExcel(file: Express.Multer.File): Promise<any> {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const results: { success: number; failed: number; errors: any[] } = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const row of data as any[]) {
        try {
          const record = row as Record<string, any>;
          const employeeDto: CreateEmployeeDto = {
            nik: record['NIK'] || record['nik'],
            nama: record['Nama'] || record['nama'],
            departemen: record['Departemen'] || record['departemen'],
            jabatan: record['Jabatan'] || record['jabatan'],
            status: record['Status'] || record['status'] || 'aktif',
          };

          // Validate required fields
          if (!employeeDto.nik || !employeeDto.nama) {
            throw new Error('NIK dan Nama wajib diisi');
          }

          await this.create(employeeDto);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: row,
            error: error.message,
          } as any);
        }
      }

      return {
        success: true,
        message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
        data: results,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal import Excel: ${(error as Error).message}`,
      );
    }
  }

  async getEmployeesForDevice(): Promise<any[]> {
    const employees = await this.employeeRepository.find({
      where: { status: 'aktif' },
      relations: ['fingerprint_templates'],
    });

    return employees.map((emp) => ({
      pin: emp.nik,
      name: emp.nama,
      templates: emp.fingerprint_templates || [],
    }));
  }

  // Private helper methods
  private async pushToAllDevices(employee: Employee): Promise<void> {
    const devices = await this.deviceRepository.find({
      where: { status: 'online' },
    });

    for (const device of devices) {
      try {
        const config = {
          ipAddress: device.ip_address,
          port: device.port,
          commKey: device.comm_key || '0',
          timeout: 5000,
        };

        await this.fingerprintDeviceService.uploadEmployee(
          config,
          employee.nik,
          employee.nama,
        );

        this.logger.log(
          `Pushed employee ${employee.nik} to device ${device.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to push employee to device ${device.name}: ${(error as Error).message}`,
        );
      }
    }
  }

  private async deleteFromAllDevices(nik: string): Promise<void> {
    const devices = await this.deviceRepository.find({
      where: { status: 'online' },
    });

    for (const device of devices) {
      try {
        const config = {
          ipAddress: device.ip_address,
          port: device.port,
          commKey: device.comm_key || '0',
          timeout: 5000,
        };

        await this.fingerprintDeviceService.deleteEmployee(config, nik);
        this.logger.log(`Deleted employee ${nik} from device ${device.name}`);
      } catch (error) {
        this.logger.error(
          `Failed to delete employee from device ${device.name}: ${(error as Error).message}`,
        );
      }
    }
  }

  private async pushFingerprintToAllDevices(
    nik: string,
    fingerIndex: number,
    template: string,
    targetDeviceId?: string,
  ): Promise<void> {
    let devices: Device[];

    if (targetDeviceId) {
      const device = await this.deviceRepository.findOne({
        where: { id: targetDeviceId, status: 'online' },
      });
      devices = device ? [device] : [];
      if (devices.length === 0) {
        this.logger.warn(
          `Target device ${targetDeviceId} not found or not online.`,
        );
      }
    } else {
      devices = await this.deviceRepository.find({
        where: { status: 'online' },
      });
    }

    for (const device of devices) {
      try {
        const config = {
          ipAddress: device.ip_address,
          port: device.port,
          commKey: device.comm_key || '0',
          timeout: 5000,
        };

        await this.fingerprintDeviceService.uploadFingerprintTemplate(
          config,
          nik,
          fingerIndex,
          template,
        );

        this.logger.log(
          `Pushed fingerprint template for ${nik} to device ${device.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to push template to device ${device.name}: ${(error as Error).message}`,
        );
      }
    }
  }
}
