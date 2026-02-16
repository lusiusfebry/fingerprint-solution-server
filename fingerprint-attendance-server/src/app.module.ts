import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DevicesModule } from './modules/devices/devices.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { FingerprintTemplatesModule } from './modules/fingerprint-templates/fingerprint-templates.module';
import { AttendanceLogsModule } from './modules/attendance-logs/attendance-logs.module';
import { SyncHistoryModule } from './modules/sync-history/sync-history.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { RolesModule } from './modules/roles/roles.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { BackupModule } from './modules/backup/backup.module';
import { SystemInfoModule } from './modules/system-info/system-info.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Auto-create tables in dev
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    AuditLogsModule,
    DevicesModule,
    EmployeesModule,
    FingerprintTemplatesModule,
    AttendanceLogsModule,
    SyncHistoryModule,
    ShiftsModule,
    RolesModule,
    SystemSettingsModule,
    BackupModule,
    SystemInfoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
