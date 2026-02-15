import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayload } from './dto/token-payload.interface';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.is_active) {
      const isMatch = await CryptoUtil.comparePassword(pass, user.password);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result as User;
      }
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    await this.usersService.updateLastLogin(user.id);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.auditLogsService.createLog({
      user_id: user.id,
      action: 'LOGIN',
      resource: 'auth',
      resource_id: user.id,
      details: { username: user.username },
      ip_address: ip,
      user_agent: userAgent,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role.name,
      },
      expires_in: parseInt(
        this.configService.get<string>('JWT_EXPIRATION') || '3600',
        10,
      ),
    };
  }

  generateTokens(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role.id,
      role_name: user.role.name,
      permissions: user.role.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
          '7d') as any,
      }),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(
        refreshTokenDto.refresh_token,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('User inactive or not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, ip: string, userAgent: string) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.auditLogsService.createLog({
      user_id: userId,
      action: 'LOGOUT',
      resource: 'auth',
      resource_id: userId,
      ip_address: ip,
      user_agent: userAgent,
      details: {},
    });
    await Promise.resolve();
    return { message: 'Logged out successfully' };
  }
}
