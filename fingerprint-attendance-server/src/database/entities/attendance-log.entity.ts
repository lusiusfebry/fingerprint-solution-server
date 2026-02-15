import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Device } from './device.entity';

@Entity('attendance_logs')
@Index(['employee_id', 'timestamp'])
@Index(['device_id', 'timestamp'])
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employee_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'integer' })
  verify_type: number; // 0=password, 1=fingerprint, 15=face

  @Column({ type: 'integer' })
  in_out_mode: number; // 0=check in, 1=check out, 2=break out, 3=break in

  @CreateDateColumn()
  created_at: Date;
}
