import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };

  @ApiProperty()
  expires_in: number;
}
