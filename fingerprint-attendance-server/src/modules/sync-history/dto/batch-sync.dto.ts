import { IsArray, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BatchSyncDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  deviceIds: string[];

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
}
