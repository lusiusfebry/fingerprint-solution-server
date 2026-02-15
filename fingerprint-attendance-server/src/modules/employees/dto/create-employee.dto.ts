import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'NIK Karyawan', example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nik: string;

  @ApiProperty({ description: 'Nama Karyawan', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nama: string;

  @ApiProperty({ description: 'Departemen', example: 'IT', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  departemen?: string;

  @ApiProperty({
    description: 'Jabatan',
    example: 'Software Engineer',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jabatan?: string;

  @ApiProperty({
    description: 'Status',
    enum: ['aktif', 'nonaktif'],
    default: 'aktif',
  })
  @IsEnum(['aktif', 'nonaktif'])
  @IsOptional()
  status?: string = 'aktif';
}
