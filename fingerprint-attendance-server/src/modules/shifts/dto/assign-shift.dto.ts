import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  shift_id: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsDateString()
  @IsNotEmpty()
  tanggal_mulai: string;

  @ApiProperty({ example: '2023-12-31', required: false })
  @IsDateString()
  @IsOptional()
  tanggal_selesai?: string;
}
