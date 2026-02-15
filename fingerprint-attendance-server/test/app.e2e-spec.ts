import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupTestDatabase, teardownTestDatabase } from './test-db.config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupTestDatabase();
    await teardownTestDatabase();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });
});
