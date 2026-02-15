import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // hashed dengan bcrypt

  @Column({ type: 'varchar', length: 200 })
  full_name: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
