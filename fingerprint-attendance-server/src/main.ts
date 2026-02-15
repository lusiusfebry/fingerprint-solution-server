import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLoggerService } from './common/logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
  });

  // Global prefix untuk semua routes
  app.setGlobalPrefix('api');

  // Enable CORS untuk frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Fingerprint Attendance Server API')
    .setDescription(
      'Dokumentasi API untuk sistem manajemen mesin fingerprint dan absensi karyawan. ' +
        'Mendukung sinkronisasi data mesin X105D, manajemen shift, dan laporan absensi.',
    )
    .setVersion('1.0')
    .setContact(
      'Support Team',
      'https://primasaranagemilang.com',
      'support@primasaranagemilang.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Local Development')
    .addTag('Auth', 'Otentikasi dan manajemen token')
    .addTag('Devices', 'Manajemen perangkat fingerprint dan sinkronisasi')
    .addTag('Employees', 'Manajemen data karyawan dan profil')
    .addTag('Attendance', 'Log absensi dan kalkulasi waktu kerja')
    .addTag('Shifts', 'Pengaturan jadwal kerja dan shift')
    .addTag('Users', 'Manajemen user sistem')
    .addTag('Roles', 'Manajemen role dan hak akses (RBAC)')
    .addTag('Settings', 'Pengaturan konfigurasi sistem')
    .addTag('Backup', 'Backup dan restore database')
    .addTag('System Info', 'Informasi kesehatan dan status sistem')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan token JWT (access token)',
        in: 'header',
      },
      'JWT-auth', // This name should match the one used in @ApiBearerAuth()
    )
    .setExternalDoc(
      'Dokumentasi Lengkap (GitHub Repository)',
      'https://github.com/itpsg/fingerprint-solution-server/tree/main/fingerprint-attendance-server/docs',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
