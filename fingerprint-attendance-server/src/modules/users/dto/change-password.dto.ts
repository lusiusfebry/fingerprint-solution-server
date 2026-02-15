import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password saat ini',
    example: 'passwordLama123',
  })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({
    description: 'Password baru (min. 6 karakter)',
    example: 'passwordBaru456',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
