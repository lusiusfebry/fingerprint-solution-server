import {
  IsOptional,
  IsDate,
  IsUUID,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceLogFilterDto {
  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  verifyType?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  inOutMode?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ default: 'timestamp' })
  @IsOptional()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
