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
  @ApiProperty({
    enum: SyncType,
    description: 'Tipe sinkronisasi',
    example: SyncType.FULL,
  })
  @IsEnum(SyncType)
  sync_type: SyncType;

  @ApiProperty({
    description: 'Paksa sinkronisasi meskipun tidak ada perubahan',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  force?: boolean;
}
