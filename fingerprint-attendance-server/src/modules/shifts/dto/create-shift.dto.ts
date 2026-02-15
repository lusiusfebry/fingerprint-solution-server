import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ example: 'Shift Pagi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama: string;

  @ApiProperty({ example: '08:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'jam_masuk must be in HH:mm format',
  })
  jam_masuk: string;

  @ApiProperty({ example: '17:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'jam_pulang must be in HH:mm format',
  })
  jam_pulang: string;

  @ApiProperty({ example: 15, description: 'Tolerance in minutes' })
  @IsInt()
  @Min(0)
  @Max(120)
  toleransi_terlambat: number;

  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: '0=Sunday, 1=Monday, ..., 6=Saturday',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  hari_kerja: number[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
