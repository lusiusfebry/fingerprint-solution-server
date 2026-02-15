import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token untuk mendapatkan access token baru',
    example: 'd8f5a6b7-c9d0-4e1f-a2b3-c4d5e6f7a8b9',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Informasi detail user',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'admin',
      email: 'admin@example.com',
      full_name: 'Administrator System',
      role: 'Super Admin',
    },
  })
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };

  @ApiProperty({
    description: 'Waktu kadaluarsa token dalam detik',
    example: 3600,
  })
  expires_in: number;
}
