/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  testDataSource,
  setupTestDatabase,
  seedTestData,
  teardownTestDatabase,
} from './test-db.config';
import { Employee } from '../src/database/entities/employee.entity';
import { Device } from '../src/database/entities/device.entity';
import { AttendanceLog } from '../src/database/entities/attendance-log.entity';

describe('AttendanceLogsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    await seedTestData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin_test',
        password: 'admin123',
      });
    authToken = loginRes.body.access_token;

    // Seed Employee & Device & Logs
    const empRepo = testDataSource.getRepository(Employee);
    const devRepo = testDataSource.getRepository(Device);
    const logRepo = testDataSource.getRepository(AttendanceLog);

    const emp = await empRepo.save(
      empRepo.create({ nik: 'ATT01', nama: 'Att One', status: 'aktif' }),
    );
    const dev = await devRepo.save(
      devRepo.create({
        name: 'Dev Att',
        serial_number: 'SN-ATT',
        ip_address: '1.1.1.1',
      }),
    );

    await logRepo.save(
      logRepo.create({
        employee_id: emp.id,
        device_id: dev.id,
        timestamp: new Date(),
        verify_type: 1,
        in_out_mode: 0,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('/attendance/logs (GET)', () => {
    it('should return attendance logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/attendance/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('/attendance/summary (GET)', () => {
    it('should return attendance summary', async () => {
      await request(app.getHttpServer())
        .get('/api/attendance/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/attendance/calculate (GET)', () => {
    it('should return calculated results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/attendance/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ start_date: '2024-01-01', end_date: '2024-12-31' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });
});
