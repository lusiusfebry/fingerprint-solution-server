import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username unik pengguna', example: 'yusuf_dev' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @ApiProperty({
    description: 'Alamat email aktif',
    example: 'yusuf@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (min. 6 karakter)',
    example: 'secret123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nama lengkap pengguna',
    example: 'Yusuf Maulana',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  full_name: string;

  @ApiProperty({
    description: 'ID Role (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  role_id: string;

  @ApiProperty({
    description: 'Status aktif user',
    required: false,
    default: true,
    example: true,
  })
  @IsOptional()
  is_active?: boolean;
}
