import { ApiProperty } from '@nestjs/swagger';
import {
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ description: 'Nama Perangkat', example: 'Pintu Utama Lobby' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Nomor Seri Perangkat', example: 'SN12345678' })
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @ApiProperty({ description: 'Alamat IP Perangkat', example: '192.168.1.201' })
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @ApiProperty({
    description: 'Port Komunikasi (Default: 80)',
    example: 80,
    default: 80,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  port?: number = 80;

  @ApiProperty({
    description: 'Lokasi Penempatan',
    example: 'Lobby Lantai 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Kunci Komunikasi (Comm Key)',
    example: '0',
    default: '0',
    required: false,
  })
  @IsString()
  @IsOptional()
  comm_key?: string = '0';
}
