import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceLogFilterDto } from './attendance-log-filter.dto';
import { Transform } from 'class-transformer';

export class ExportFilterDto extends AttendanceLogFilterDto {
  @ApiPropertyOptional({ enum: ['xlsx', 'csv'], default: 'xlsx' })
  @IsOptional()
  @IsEnum(['xlsx', 'csv'])
  format?: 'xlsx' | 'csv' = 'xlsx';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeHeaders?: boolean = true;

  @ApiPropertyOptional()
  @IsOptional()
  filename?: string;
}
