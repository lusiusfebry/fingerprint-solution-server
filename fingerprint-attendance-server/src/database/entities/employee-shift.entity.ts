import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Shift } from './shift.entity';

@Entity('employee_shifts')
@Index(['employee_id', 'shift_id'])
export class EmployeeShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employee_id: string;

  @Column()
  shift_id: string;

  @Column({ type: 'date' })
  tanggal_mulai: Date;

  @Column({ type: 'date', nullable: true })
  tanggal_selesai: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Employee, (employee) => employee.employee_shifts)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Shift, (shift) => shift.employee_shifts)
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;
}
