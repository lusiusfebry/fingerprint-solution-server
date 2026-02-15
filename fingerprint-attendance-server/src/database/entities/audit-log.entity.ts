import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true }) // Nullable because some actions might be done by system or unauthenticated (login attempt)
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column({ name: 'resource_id', nullable: true })
  resource_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ name: 'ip_address', nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  timestamp: Date;
}
