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
  teardownTestDatabase,
} from './test-db.config';
import { CryptoUtil } from '../src/common/utils/crypto.util';
import { Role } from '../src/database/entities/role.entity';
import { User } from '../src/database/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Seed Super Admin Role and User
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
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('/api/auth/login (POST)', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin_test',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.user.username).toBe('admin_test');
    });

    it('should fail with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin_test',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    it('should return profile for authenticated user', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin_test',
          password: 'admin123',
        });

      const token = loginRes.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.username).toBe('admin_test');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 for unauthenticated user', async () => {
      await request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });
  });

  describe('/api/auth/refresh-token (POST)', () => {
    it('should return new tokens with valid refresh token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin_test',
          password: 'admin123',
        });

      const refreshToken = loginRes.body.refresh_token;

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });
  });
});
