import { ApiProperty } from '@nestjs/swagger';
import {
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class TestConnectionDto {
  @ApiProperty()
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  port: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comm_key?: string;
}
