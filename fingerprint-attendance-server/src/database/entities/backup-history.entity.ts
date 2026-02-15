import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('backup_history')
export class BackupHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  file_path: string;

  @Column({ type: 'bigint' })
  size_bytes: number;

  @Column({ enum: ['manual', 'auto'], default: 'manual' })
  type: 'manual' | 'auto';

  @Column({ enum: ['success', 'failed'], default: 'success' })
  status: 'success' | 'failed';

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;
}
