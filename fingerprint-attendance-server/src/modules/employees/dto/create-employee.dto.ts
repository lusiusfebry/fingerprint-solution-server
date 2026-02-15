import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nomor Induk Karyawan (Unique)',
    example: 'EMP001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nik: string;

  @ApiProperty({
    description: 'Nama Lengkap Karyawan',
    example: 'Yusuf Maulana',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nama: string;

  @ApiProperty({
    description: 'Nama Departemen',
    example: 'IT Support',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  departemen?: string;

  @ApiProperty({
    description: 'Jabatan Karyawan',
    example: 'Senior Developer',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jabatan?: string;

  @ApiProperty({
    description: 'Status Kepegawaian',
    enum: ['aktif', 'nonaktif'],
    default: 'aktif',
    example: 'aktif',
  })
  @IsEnum(['aktif', 'nonaktif'])
  @IsOptional()
  status?: string = 'aktif';
}
