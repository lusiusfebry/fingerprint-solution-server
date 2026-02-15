import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncHistoryFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiProperty({
    required: false,
    enum: ['pull_logs', 'push_employees', 'push_templates', 'sync_time'],
  })
  @IsOptional()
  @IsEnum(['pull_logs', 'push_employees', 'push_templates', 'sync_time'])
  syncType?: string;

  @ApiProperty({ required: false, enum: ['success', 'failed', 'partial'] })
  @IsOptional()
  @IsEnum(['success', 'failed', 'partial'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
