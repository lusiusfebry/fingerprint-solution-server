import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // 'Super Admin', 'HR', 'IT'

  @Column({ type: 'text', nullable: true })
  description: string;

  // @Column({ type: 'jsonb' })
  // permissions: object; // Deprecated in favor of relation

  @OneToMany(() => Permission, (permission) => permission.role, {
    cascade: true,
  })
  permissions: Permission[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
