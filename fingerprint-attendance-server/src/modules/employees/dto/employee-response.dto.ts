import { ApiProperty } from '@nestjs/swagger';

export class EmployeeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nik: string;

  @ApiProperty()
  nama: string;

  @ApiProperty()
  departemen: string;

  @ApiProperty()
  jabatan: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  fingerprint_count?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
