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
    description: 'Finger Index (0-9)',
    example: 0,
    minimum: 0,
    maximum: 9,
  })
  @IsInt()
  @Min(0)
  @Max(9)
  finger_index: number;

  @ApiProperty({
    description: 'Template Data (base64 encoded)',
    example: 'BASE64_ENCODED_TEMPLATE_DATA',
  })
  @IsString()
  @IsNotEmpty()
  template_data: string;

  @ApiProperty({ description: 'Target Device ID (Optional)', required: false })
  @IsString()
  @IsOptional()
  device_id?: string;
}
