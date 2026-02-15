import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('fingerprint_templates')
@Unique(['employee_id', 'finger_index'])
export class FingerprintTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employee_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'integer' })
  finger_index: number; // 0-9 untuk 10 jari

  @Column({ type: 'text' })
  template_data: string; // base64 encoded template

  @Column({ type: 'integer', default: 1 })
  version: number;

  @CreateDateColumn()
  created_at: Date;
}
