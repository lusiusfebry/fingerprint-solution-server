import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsEmail,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSystemSettingsDto {
  @ApiProperty({
    description: 'Nama Aplikasi',
    example: 'Fingerprint Attendance System',
    required: false,
  })
  @IsString()
  @IsOptional()
  app_name?: string;

  @ApiProperty({
    description: 'Interval sinkronisasi otomatis (menit)',
    example: 60,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(1440)
  @IsOptional()
  @Type(() => Number)
  sync_interval?: number;

  @ApiProperty({
    description: 'Mode resolusi konflik data',
    enum: ['server', 'device'],
    example: 'server',
    required: false,
  })
  @IsEnum(['server', 'device'])
  @IsOptional()
  conflict_resolution_mode?: 'server' | 'device';

  @ApiProperty({
    description: 'Jumlah maksimal percobaan ulang sinkronisasi',
    example: 3,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  max_retry_attempts?: number;

  @ApiProperty({
    description: 'Email untuk notifikasi sistem',
    example: 'admin@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  notification_email?: string;

  @ApiProperty({
    description: 'Mode pemeliharaan sistem',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  maintenance_mode?: boolean;

  @ApiProperty({
    description: 'Aktifkan backup otomatis',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  auto_backup_enabled?: boolean;

  @ApiProperty({
    description: 'Jadwal backup (Cron expression)',
    example: '0 0 * * *',
    required: false,
  })
  @IsString()
  @IsOptional()
  backup_schedule?: string; // cron expression

  @ApiProperty({
    description: 'Aktifkan notifikasi email',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  email_notifications_enabled?: boolean;

  @ApiProperty({
    description: 'Aktifkan notifikasi SMS',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  sms_notifications_enabled?: boolean;

  @ApiProperty({
    description: 'Daftar penerima notifikasi',
    example: ['admin@example.com', 'hrd@example.com'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  notification_recipients?: string[];
}
