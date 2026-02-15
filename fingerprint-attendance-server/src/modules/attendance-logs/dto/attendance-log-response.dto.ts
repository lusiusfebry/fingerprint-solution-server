import { ApiProperty } from '@nestjs/swagger';

export class AttendanceLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employee_id: string;

  @ApiProperty()
  employee_nik: string;

  @ApiProperty()
  employee_nama: string;

  @ApiProperty()
  employee_departemen: string;

  @ApiProperty()
  device_id: string;

  @ApiProperty()
  device_name: string;

  @ApiProperty()
  device_location: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  verify_type: number;

  @ApiProperty()
  verify_type_label: string;

  @ApiProperty()
  in_out_mode: number;

  @ApiProperty()
  in_out_mode_label: string;

  @ApiProperty()
  created_at: Date;
}
