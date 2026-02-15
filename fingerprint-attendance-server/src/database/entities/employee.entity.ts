import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FingerprintTemplate } from './fingerprint-template.entity';
import { AttendanceLog } from './attendance-log.entity';
import { EmployeeShift } from './employee-shift.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nik: string;

  @Column({ type: 'varchar', length: 200 })
  nama: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departemen: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jabatan: string;

  @Column({ type: 'enum', enum: ['aktif', 'nonaktif'], default: 'aktif' })
  status: string;

  @OneToMany(() => FingerprintTemplate, (template) => template.employee, {
    cascade: true,
  })
  fingerprint_templates: FingerprintTemplate[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AttendanceLog, (log) => log.employee)
  attendance_logs: AttendanceLog[];

  @OneToMany(() => EmployeeShift, (shift) => shift.employee)
  employee_shifts: EmployeeShift[];
}
