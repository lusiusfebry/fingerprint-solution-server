import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class UploadFingerprintDto {
  @ApiProperty({
    description: 'Indeks jari (0-9)',
    example: 0,
    minimum: 0,
    maximum: 9,
  })
  @IsInt()
  @Min(0)
  @Max(9)
  finger_index: number;

  @ApiProperty({
    description: 'Data template sidik jari (base64 encoded)',
    example: 'dGhpcyBpcyBhIGZpbmdlcnByaW50IHRlbXBsYXRl...',
  })
  @IsString()
  @IsNotEmpty()
  template_data: string;

  @ApiProperty({
    description:
      'ID Perangkat target (Opsional, jika ingin langsung kirim ke mesin)',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  device_id?: string;
}
