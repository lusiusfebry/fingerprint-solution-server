import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class AttendanceCalculationFilterDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  employee_id?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  shift_id?: string;

  @ApiProperty({
    enum: ['hadir', 'terlambat', 'alpha', 'libur'],
    required: false,
  })
  @IsEnum(['hadir', 'terlambat', 'alpha', 'libur'])
  @IsOptional()
  status_kehadiran?: 'hadir' | 'terlambat' | 'alpha' | 'libur';

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  limit?: number;
}
