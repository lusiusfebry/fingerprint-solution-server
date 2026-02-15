import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EmployeeShift } from './employee-shift.entity';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nama: string;

  @Column({ type: 'time' })
  jam_masuk: string;

  @Column({ type: 'time' })
  jam_pulang: string;

  @Column({ type: 'int', default: 0 })
  toleransi_terlambat: number;

  @Column('simple-array')
  hari_kerja: number[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => EmployeeShift, (employeeShift) => employeeShift.shift)
  employee_shifts: EmployeeShift[];
}
