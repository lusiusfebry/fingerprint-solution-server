import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  const superAdminRole = await roleRepository.findOne({
    where: { name: 'Super Admin' },
  });

  if (!superAdminRole) {
    console.error('Super Admin role not found. Run seedRoles first.');
    return;
  }

  const adminUser = await userRepository.findOne({
    where: { username: 'admin' },
  });

  if (!adminUser) {
    const hashedPassword = await CryptoUtil.hashPassword('Admin123!');
    const user = userRepository.create({
      username: 'admin',
      email: 'admin@fingerprint.local',
      password: hashedPassword,
      full_name: 'System Administrator',
      role: superAdminRole,
      is_active: true,
    });
    await userRepository.save(user);
    console.log('Super Admin user created.');
  } else {
    console.log('Super Admin user already exists.');
  }
}
