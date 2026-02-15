import { ApiProperty } from '@nestjs/swagger';
import {
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class TestConnectionDto {
  @ApiProperty({ description: 'Alamat IP Perangkat', example: '192.168.1.201' })
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @ApiProperty({ description: 'Port Komunikasi', example: 80 })
  @IsNumber()
  @IsNotEmpty()
  port: number;

  @ApiProperty({
    description: 'Kunci Komunikasi (Comm Key)',
    example: '0',
    required: false,
  })
  @IsString()
  @IsOptional()
  comm_key?: string;
}
