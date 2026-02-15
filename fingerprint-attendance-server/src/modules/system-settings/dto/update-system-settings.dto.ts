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

export class UpdateSystemSettingsDto {
  @IsString()
  @IsOptional()
  app_name?: string;

  @IsNumber()
  @Min(1)
  @Max(1440)
  @IsOptional()
  @Type(() => Number)
  sync_interval?: number;

  @IsEnum(['server', 'device'])
  @IsOptional()
  conflict_resolution_mode?: 'server' | 'device';

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  max_retry_attempts?: number;

  @IsEmail()
  @IsOptional()
  notification_email?: string;

  @IsBoolean()
  @IsOptional()
  maintenance_mode?: boolean;

  @IsBoolean()
  @IsOptional()
  auto_backup_enabled?: boolean;

  @IsString()
  @IsOptional()
  backup_schedule?: string; // cron expression

  @IsBoolean()
  @IsOptional()
  email_notifications_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  sms_notifications_enabled?: boolean;

  @IsString({ each: true })
  @IsOptional()
  notification_recipients?: string[];
}
