/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FingerprintDeviceService } from '../src/modules/devices/services/fingerprint-device.service';
import {
  setupTestDatabase,
  seedTestData,
  teardownTestDatabase,
  testDataSource,
} from './test-db.config';
import { Device } from '../src/database/entities/device.entity';

describe('EmployeesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  const mockFingerprintService = {
    uploadEmployee: jest.fn().mockResolvedValue({ success: true }),
    deleteEmployee: jest.fn().mockResolvedValue({ success: true }),
    uploadFingerprintTemplate: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeAll(async () => {
    await setupTestDatabase();
    await seedTestData();

    // Seed an online device
    const devRepo = testDataSource.getRepository(Device);
    await devRepo.save(
      devRepo.create({
        name: 'Test Device',
        serial_number: 'SN-TEST',
        ip_address: '1.2.3.4',
        status: 'online',
      }),
    );

    await teardownTestDatabase(); // Close seeding connection

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FingerprintDeviceService)
      .useValue(mockFingerprintService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin_test',
        password: 'admin123',
      });
    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('/api/employees (POST)', () => {
    it('should create a new employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nik: 'E001',
          nama: 'Employee One',
          departemen: 'IT',
          status: 'aktif',
        })
        .expect(201);

      expect(response.body.nik).toBe('E001');
    });

    it('should fail if NIK is duplicate', async () => {
      await request(app.getHttpServer())
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nik: 'E001',
          nama: 'Employee Duplicate',
        })
        .expect(400);
    });
  });

  describe('/api/employees (GET)', () => {
    it('should list all employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/api/employees/:id/fingerprint (POST)', () => {
    it('should upload fingerprint template', async () => {
      const employeesRes = await request(app.getHttpServer())
        .get('/api/employees')
        .set('Authorization', `Bearer ${authToken}`);
      const empId = employeesRes.body[0].id;

      await request(app.getHttpServer())
        .post(`/api/employees/${empId}/fingerprint`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          finger_index: 0,
          template_data: 'test-template-data',
        })
        .expect(201);

      expect(
        mockFingerprintService.uploadFingerprintTemplate,
      ).toHaveBeenCalled();
    });
  });
});
