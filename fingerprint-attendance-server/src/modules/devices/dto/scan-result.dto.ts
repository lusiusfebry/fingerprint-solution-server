import { ApiProperty } from '@nestjs/swagger';

export class ScanResultDto {
  @ApiProperty()
  ip_address: string;

  @ApiProperty()
  port: number;

  @ApiProperty()
  isReachable: boolean;

  @ApiProperty({ required: false })
  deviceInfo?: any;
}
