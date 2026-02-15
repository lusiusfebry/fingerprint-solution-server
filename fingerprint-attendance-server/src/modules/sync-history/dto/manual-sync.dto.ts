import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManualSyncDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiProperty({
    enum: [
      'pull_logs',
      'push_employees',
      'push_templates',
      'sync_time',
      'full',
    ],
  })
  @IsEnum([
    'pull_logs',
    'push_employees',
    'push_templates',
    'sync_time',
    'full',
  ])
  syncType: string;

  @ApiProperty({
    required: false,
    enum: ['server_override', 'device_override'],
  })
  @IsOptional()
  @IsEnum(['server_override', 'device_override'])
  conflictMode?: string;
}
