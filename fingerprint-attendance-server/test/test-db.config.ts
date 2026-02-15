import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Device } from '../src/database/entities/device.entity';
import { Employee } from '../src/database/entities/employee.entity';
import { AttendanceLog } from '../src/database/entities/attendance-log.entity';
import { User } from '../src/database/entities/user.entity';
import { Role } from '../src/database/entities/role.entity';
import { FingerprintTemplate } from '../src/database/entities/fingerprint-template.entity';
import { SystemSetting } from '../src/database/entities/system-setting.entity';
import { Shift } from '../src/database/entities/shift.entity';
import { EmployeeShift } from '../src/database/entities/employee-shift.entity';
import { SyncHistory } from '../src/database/entities/sync-history.entity';
import { AuditLog } from '../src/database/entities/audit-log.entity';
import { Permission } from '../src/database/entities/permission.entity';
import { CryptoUtil } from '../src/common/utils/crypto.util';

config();
// Ensure the application uses the test database during E2E tests
process.env.DB_DATABASE =
  process.env.DB_DATABASE_TEST || 'fingerprint_attendance_test';

export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_DATABASE_TEST || 'fingerprint_attendance_test',
  entities: [
    Device,
    Employee,
    AttendanceLog,
    User,
    Role,
    FingerprintTemplate,
    SystemSetting,
    Shift,
    EmployeeShift,
    SyncHistory,
    AuditLog,
    Permission,
  ],
  synchronize: true, // Use synchronize for speed in tests, or false & run migrations
  dropSchema: true,
});

export const setupTestDatabase = async () => {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
};

export const seedTestData = async () => {
  const roleRepo = testDataSource.getRepository(Role);
  const userRepo = testDataSource.getRepository(User);

  let adminRole = await roleRepo.findOne({ where: { name: 'Super Admin' } });
  if (!adminRole) {
    adminRole = roleRepo.create({
      name: 'Super Admin',
      description: 'Full access',
    });
    await roleRepo.save(adminRole);
  }

  const existingUser = await userRepo.findOne({
    where: { username: 'admin_test' },
  });
  if (!existingUser) {
    const password = await CryptoUtil.hashPassword('admin123');
    const adminUser = userRepo.create({
      username: 'admin_test',
      email: 'admin_test@example.com',
      password: password,
      full_name: 'Admin Test',
      role_id: adminRole.id,
      is_active: true,
    });
    await userRepo.save(adminUser);
  }
};

export const teardownTestDatabase = async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
};
