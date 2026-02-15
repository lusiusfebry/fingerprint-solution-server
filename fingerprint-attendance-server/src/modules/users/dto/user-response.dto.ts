import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  last_login: Date;

  @ApiProperty()
  role: {
    id: string;
    name: string;
    description: string;
  };

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
