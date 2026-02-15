import { ApiProperty } from '@nestjs/swagger';

export class CalculatedAttendanceDto {
  @ApiProperty()
  employee_id: string;

  @ApiProperty()
  employee_nik: string;

  @ApiProperty()
  employee_nama: string;

  @ApiProperty()
  employee_departemen: string;

  @ApiProperty({ nullable: true })
  shift_id: string | null;

  @ApiProperty({ nullable: true })
  shift_nama: string | null;

  @ApiProperty({ nullable: true })
  jam_masuk_shift: string | null;

  @ApiProperty({ nullable: true })
  jam_pulang_shift: string | null;

  @ApiProperty()
  tanggal: string; // YYYY-MM-DD

  @ApiProperty()
  waktu_check_in: Date | null;

  @ApiProperty()
  waktu_check_out: Date | null;

  @ApiProperty({ enum: ['hadir', 'terlambat', 'alpha', 'libur'] })
  status_kehadiran: 'hadir' | 'terlambat' | 'alpha' | 'libur';

  @ApiProperty({ description: 'Durasi terlambat dalam menit', nullable: true })
  durasi_terlambat: number | null;

  @ApiProperty({ description: 'Jam kerja dalam jam', nullable: true })
  jam_kerja: number | null;

  @ApiProperty({ nullable: true })
  keterangan: string | null;
}
