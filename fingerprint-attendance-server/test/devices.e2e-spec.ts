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
} from './test-db.config';

describe('DevicesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  const mockFingerprintService = {
    testConnection: jest
      .fn()
      .mockResolvedValue({ success: true, message: 'Connected' }),
    restartDevice: jest.fn().mockResolvedValue({ success: true }),
    getDeviceInfo: jest.fn().mockResolvedValue({ success: true, data: {} }),
  };

  beforeAll(async () => {
    await setupTestDatabase();
    await seedTestData();
    await teardownTestDatabase(); // Close seeding connection to avoid conflicts

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

  describe('/devices (POST)', () => {
    it('should register a new device', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Device 1',
          serial_number: 'SN99999',
          ip_address: '192.168.1.50',
          port: 4370,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Device 1');
    });

    it('should fail with invalid IP address', async () => {
      await request(app.getHttpServer())
        .post('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Bad Device',
          serial_number: 'SN-BAD',
          ip_address: '999.999.999.999',
          port: 4370,
        })
        .expect(400); // Validation pipe should catch this if class-validator is used
    });
  });

  describe('/devices (GET)', () => {
    it('should return a list of devices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/devices/:id/test-connection (POST)', () => {
    it('should test connection successfully', async () => {
      const devicesRes = await request(app.getHttpServer())
        .get('/api/devices')
        .set('Authorization', `Bearer ${authToken}`);
      const devId = devicesRes.body[0].id;

      await request(app.getHttpServer())
        .post(`/api/devices/${devId}/test`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(mockFingerprintService.testConnection).toHaveBeenCalled();
    });
  });
});
