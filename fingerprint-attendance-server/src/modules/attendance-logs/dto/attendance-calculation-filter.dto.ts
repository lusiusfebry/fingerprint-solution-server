import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class AttendanceCalculationFilterDto {
  @ApiProperty({
    required: false,
    description: 'ID Karyawan (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  employee_id?: string;

  @ApiProperty({
    description: 'Tanggal mulai (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'Tanggal akhir (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({
    required: false,
    description: 'ID Shift (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  shift_id?: string;

  @ApiProperty({
    enum: ['hadir', 'terlambat', 'alpha', 'libur'],
    required: false,
    description: 'Filter berdasarkan status kehadiran',
    example: 'hadir',
  })
  @IsEnum(['hadir', 'terlambat', 'alpha', 'libur'])
  @IsOptional()
  status_kehadiran?: 'hadir' | 'terlambat' | 'alpha' | 'libur';

  @ApiProperty({ required: false, default: 1, example: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 50, example: 50 })
  @IsOptional()
  limit?: number;
}
