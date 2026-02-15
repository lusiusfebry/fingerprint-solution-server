import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty({
    description: 'ID Shift yang akan diberikan (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  shift_id: string;

  @ApiProperty({
    description: 'Tanggal mulai berlaku shift (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  tanggal_mulai: string;

  @ApiProperty({
    description: 'Tanggal berakhir berlaku shift (YYYY-MM-DD)',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  tanggal_selesai?: string;
}
