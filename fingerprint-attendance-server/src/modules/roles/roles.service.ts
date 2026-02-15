import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAllWithPermissions() {
    // Return roles with their permissions
    return this.rolesRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async createRole(name: string, description: string) {
    const role = this.rolesRepository.create({ name, description });
    return this.rolesRepository.save(role);
  }

  async updateRole(id: string, name: string, description: string) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    role.name = name;
    role.description = description;
    return this.rolesRepository.save(role);
  }

  async updatePermissions(
    roleId: string,
    permissions: { module: string; actions: string[] }[],
  ) {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    // Delete existing permissions
    await this.permissionsRepository.delete({ role_id: roleId });

    // Create new permissions
    const newPermissions: Permission[] = [];
    for (const p of permissions) {
      for (const action of p.actions) {
        const permission = this.permissionsRepository.create({
          role,
          module: p.module,
          action,
        });
        newPermissions.push(permission);
      }
    }

    await this.permissionsRepository.save(newPermissions);

    return this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
  }

  async deleteRole(id: string) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    // Permissions are cascaded or handle deletion here if needed
    return this.rolesRepository.remove(role);
  }
}
