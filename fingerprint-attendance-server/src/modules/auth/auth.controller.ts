import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Melakukan autentikasi pengguna menggunakan username dan password. Mengembalikan access token dan refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Username atau password salah' })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak percobaan login (Rate limit)',
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Mendapatkan access token baru menggunakan refresh token yang masih valid.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token berhasil diperbarui',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token tidak valid atau sudah kadaluarsa',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Menghapus session pengguna dan mencatat aktivitas logout.',
  })
  @ApiResponse({ status: 200, description: 'Berhasil logout' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: User, @Req() req: Request) {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.logout(user.id, ip, userAgent);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Mendapatkan informasi profil pengguna yang sedang login berdasarkan token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data profil berhasil diambil',
    schema: {
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        username: { type: 'string', example: 'admin' },
        email: { type: 'string', example: 'admin@example.com' },
        full_name: { type: 'string', example: 'Administrator System' },
        role: { type: 'string', example: 'Super Admin' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
