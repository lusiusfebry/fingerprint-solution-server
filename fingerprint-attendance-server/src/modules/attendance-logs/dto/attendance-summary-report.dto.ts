import { ApiProperty } from '@nestjs/swagger';

export class AttendanceSummaryReportDto {
  @ApiProperty()
  employee_id: string;

  @ApiProperty()
  employee_nik: string;

  @ApiProperty()
  employee_nama: string;

  @ApiProperty()
  periode: {
    start_date: string;
    end_date: string;
  };

  @ApiProperty()
  total_hari_kerja: number;

  @ApiProperty()
  total_hadir: number;

  @ApiProperty()
  total_terlambat: number;

  @ApiProperty()
  total_alpha: number;

  @ApiProperty()
  total_durasi_terlambat: number; // menit

  @ApiProperty()
  total_jam_kerja: number; // jam

  @ApiProperty()
  persentase_kehadiran: number;
}
