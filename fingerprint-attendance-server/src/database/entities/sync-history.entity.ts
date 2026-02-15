import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Device } from './device.entity';

@Entity('sync_history')
export class SyncHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({
    type: 'enum',
    enum: [
      'pull_logs',
      'push_employees',
      'push_templates',
      'sync_time',
      'full',
    ],
  })
  sync_type: string;

  @Column({ type: 'enum', enum: ['success', 'failed', 'partial'] })
  status: string;

  @Column({ type: 'integer', default: 0 })
  records_count: number;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn()
  timestamp: Date;
}
