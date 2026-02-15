import { ApiProperty } from '@nestjs/swagger';

export class ShiftResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nama: string;

  @ApiProperty()
  jam_masuk: string;

  @ApiProperty()
  jam_pulang: string;

  @ApiProperty()
  toleransi_terlambat: number;

  @ApiProperty()
  hari_kerja: number[];

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  total_employees: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
