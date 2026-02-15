import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum SyncType {
  PULL_LOGS = 'pull_logs',
  PUSH_EMPLOYEES = 'push_employees',
  PUSH_TEMPLATES = 'push_templates',
  SYNC_TIME = 'sync_time',
  FULL = 'full',
}

export class SyncDeviceDto {
  @ApiProperty({ enum: SyncType })
  @IsEnum(SyncType)
  sync_type: SyncType;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  force?: boolean;
}
