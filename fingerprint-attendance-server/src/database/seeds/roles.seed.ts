import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
    {
      name: 'Super Admin',
      description: 'Full access to all features',
      permissions: {
        devices: ['create', 'read', 'update', 'delete', 'sync'],
        employees: ['create', 'read', 'update', 'delete', 'import'],
        attendance: ['read', 'export'],
        users: ['create', 'read', 'update', 'delete'],
        roles: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'],
        audit: ['read'],
      },
    },
    {
      name: 'HR',
      description: 'HR department access',
      permissions: {
        devices: ['read'],
        employees: ['create', 'read', 'update', 'import'],
        attendance: ['read', 'export'],
        users: [],
        roles: [],
        settings: ['read'],
        audit: ['read'],
      },
    },
    {
      name: 'IT',
      description: 'IT support access',
      permissions: {
        devices: ['create', 'read', 'update', 'delete', 'sync'],
        employees: ['read'],
        attendance: ['read'],
        users: [],
        roles: [],
        settings: ['read', 'update'],
        audit: ['read'],
      },
    },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });
    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
    }
  }
}
