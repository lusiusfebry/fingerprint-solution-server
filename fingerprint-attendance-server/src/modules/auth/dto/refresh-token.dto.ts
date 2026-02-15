import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token yang valid',
    example: 'd8f5a6b7-c9d0-4e1f-a2b3-c4d5e6f7a8b9',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
