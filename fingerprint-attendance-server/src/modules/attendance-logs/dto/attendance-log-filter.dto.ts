import {
  IsOptional,
  IsDate,
  IsUUID,
  IsNumber,
  IsEnum,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceLogFilterDto {
  @ApiPropertyOptional({
    description: 'Tanggal mulai filter (YYYY-MM-DD)',
    type: Date,
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Tanggal akhir filter (YYYY-MM-DD)',
    type: Date,
    example: '2024-01-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'ID Karyawan (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'ID Perangkat (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Tipe verifikasi (0: Password, 1: Fingerprint, 2: Card)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  verifyType?: number;

  @ApiPropertyOptional({
    description: 'Mode In/Out (0: Check-In, 1: Check-Out)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  inOutMode?: number;

  @ApiPropertyOptional({ description: 'Cari berdasarkan nama karyawan' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan departemen' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan nama/id perangkat' })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status (present/late/absent)',
  })
  @IsOptional()
  @IsEnum(['all', 'present', 'late', 'absent'])
  status?: string;

  @ApiPropertyOptional({ description: 'Nomor halaman', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    default: 50,
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Kolom pengurutan',
    default: 'timestamp',
    example: 'timestamp',
  })
  @IsOptional()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({
    description: 'Arah pengurutan',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    example: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';
}
