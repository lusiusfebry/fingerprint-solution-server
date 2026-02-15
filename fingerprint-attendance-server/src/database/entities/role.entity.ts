import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // 'Super Admin', 'HR', 'IT'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  permissions: object; // { devices: ['read', 'write'], employees: ['read', 'write'], ... }

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
