import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  serial_number: string;

  @Column({ type: 'varchar', length: 15 })
  ip_address: string;

  @Column({ type: 'integer', default: 80 })
  port: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: ['online', 'offline', 'syncing', 'error'],
    default: 'offline',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  last_sync_time: Date;

  @Column({ type: 'varchar', length: 50, default: '0' })
  comm_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
