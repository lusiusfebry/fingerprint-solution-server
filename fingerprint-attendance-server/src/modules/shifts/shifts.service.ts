import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../database/entities/shift.entity';
import { EmployeeShift } from '../../database/entities/employee-shift.entity';
import { Employee } from '../../database/entities/employee.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftResponseDto } from './dto/shift-response.dto';
import { AssignShiftDto } from './dto/assign-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(EmployeeShift)
    private readonly employeeShiftRepository: Repository<EmployeeShift>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    this.validateShiftTimes(
      createShiftDto.jam_masuk,
      createShiftDto.jam_pulang,
    );
    const shift = this.shiftRepository.create(createShiftDto);
    return this.shiftRepository.save(shift);
  }

  private validateShiftTimes(masuk: string, pulang: string) {
    if (masuk === pulang) {
      throw new BadRequestException(
        'Jam masuk and Jam pulang cannot be the same',
      );
    }
  }

  async findAll(onlyActive: boolean = false): Promise<ShiftResponseDto[]> {
    const query = this.shiftRepository
      .createQueryBuilder('shift')
      .loadRelationCountAndMap(
        'shift.total_employees',
        'shift.employee_shifts',
        'es',
        (qb) => qb.where('es.is_active = :isActive', { isActive: true }),
      );

    if (onlyActive) {
      query.where('shift.is_active = :isActive', { isActive: true });
    }

    const shifts = await query.getMany();
    return shifts as unknown as ShiftResponseDto[];
  }

  async findOne(id: string): Promise<ShiftResponseDto> {
    const shift = await this.shiftRepository
      .createQueryBuilder('shift')
      .loadRelationCountAndMap(
        'shift.total_employees',
        'shift.employee_shifts',
        'es',
        (qb) => qb.where('es.is_active = :isActive', { isActive: true }),
      )
      .where('shift.id = :id', { id })
      .getOne();

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift as unknown as ShiftResponseDto;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    // Convert back to Entity type for update
    const shiftEntity = await this.shiftRepository.findOneBy({ id });
    if (!shiftEntity) throw new NotFoundException();

    const mergedMasuk = updateShiftDto.jam_masuk ?? shiftEntity.jam_masuk;
    const mergedPulang = updateShiftDto.jam_pulang ?? shiftEntity.jam_pulang;
    this.validateShiftTimes(mergedMasuk, mergedPulang);

    Object.assign(shiftEntity, updateShiftDto);
    return this.shiftRepository.save(shiftEntity);
  }

  async remove(id: string): Promise<void> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['employee_shifts'],
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    const hasActiveAssignments = shift.employee_shifts.some(
      (es) => es.is_active,
    );

    if (hasActiveAssignments) {
      // Soft delete by deactivating
      shift.is_active = false;
      await this.shiftRepository.save(shift);
    } else {
      // Hard delete if no usage
      await this.shiftRepository.remove(shift);
    }
  }

  async getActiveShifts(): Promise<Shift[]> {
    return this.shiftRepository.find({ where: { is_active: true } });
  }

  async getShiftByEmployee(
    employeeId: string,
    date: Date = new Date(),
  ): Promise<Shift | null> {
    const dateStr = date.toISOString().split('T')[0];

    const assignment = await this.employeeShiftRepository
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.shift', 'shift')
      .where('es.employee_id = :employeeId', { employeeId })
      .andWhere('es.is_active = :isActive', { isActive: true })
      .andWhere('es.tanggal_mulai <= :date', { date: dateStr })
      .andWhere('(es.tanggal_selesai IS NULL OR es.tanggal_selesai >= :date)', {
        date: dateStr,
      })
      .getOne();

    return assignment ? assignment.shift : null;
  }

  async assignShiftToEmployee(
    employeeId: string,
    dto: AssignShiftDto,
  ): Promise<EmployeeShift> {
    const employee = await this.employeeRepository.findOneBy({
      id: employeeId,
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const shift = await this.shiftRepository.findOneBy({ id: dto.shift_id });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${dto.shift_id} not found`);
    }

    // Deactivate current active assignments for this employee
    await this.employeeShiftRepository
      .createQueryBuilder()
      .update(EmployeeShift)
      .set({ is_active: false, tanggal_selesai: new Date() }) // Set end date to now
      .where('employee_id = :employeeId', { employeeId })
      .andWhere('is_active = :isActive', { isActive: true })
      .execute();

    const newAssignment = this.employeeShiftRepository.create({
      employee_id: employeeId,
      shift_id: dto.shift_id,
      tanggal_mulai: new Date(dto.tanggal_mulai),
      tanggal_selesai: dto.tanggal_selesai
        ? new Date(dto.tanggal_selesai)
        : undefined,
      is_active: true,
    } as unknown as EmployeeShift);

    return this.employeeShiftRepository.save(newAssignment);
  }

  async removeShiftFromEmployee(
    employeeId: string,
    shiftId: string,
  ): Promise<void> {
    const assignment = await this.employeeShiftRepository.findOne({
      where: {
        employee_id: employeeId,
        shift_id: shiftId,
        is_active: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Active shift assignment not found');
    }

    assignment.is_active = false;
    assignment.tanggal_selesai = new Date();
    await this.employeeShiftRepository.save(assignment);
  }

  async getEmployeesByShift(shiftId: string): Promise<EmployeeShift[]> {
    return this.employeeShiftRepository.find({
      where: { shift_id: shiftId, is_active: true },
      relations: ['employee'],
    });
  }
}
