import { ApiProperty } from '@nestjs/swagger';
import {
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ description: 'Device Name', example: 'Main Entrance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Serial Number', example: 'SN12345678' })
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @ApiProperty({ description: 'IP Address', example: '192.168.1.201' })
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @ApiProperty({
    description: 'Port',
    example: 80,
    default: 80,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  port?: number = 80;

  @ApiProperty({ description: 'Location', example: 'Lobby', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Communication Key',
    example: '0',
    default: '0',
    required: false,
  })
  @IsString()
  @IsOptional()
  comm_key?: string = '0';
}
