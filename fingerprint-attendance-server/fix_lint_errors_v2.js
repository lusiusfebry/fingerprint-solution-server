const fs = require('fs');
const path = require('path');

const authServiceContent = `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
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

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    await this.usersService.updateLastLogin(user.id);

    // TODO: Log audit trail here (requires AuditService injection)

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
          '7d') as any,
      }),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as TokenPayload;

      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('User inactive or not found');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(userId: string) {
    // TODO: Log audit trail
    await Promise.resolve();
    return { message: 'Logged out successfully' };
  }
}
`;

const jwtStrategyContent = `import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { TokenPayload } from '../dto/token-payload.interface';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: TokenPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = (await this.usersService.findOne(payload.sub)) as User;
    if (!user || !user.is_active) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
`;

const currentUserDecoratorContent = `import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../database/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
    return request.user as User;
  },
);
`;

const files = [
    {
        path: 'src/modules/auth/auth.service.ts',
        content: authServiceContent
    },
    {
        path: 'src/modules/auth/strategies/jwt.strategy.ts',
        content: jwtStrategyContent
    },
    {
        path: 'src/modules/auth/decorators/current-user.decorator.ts',
        content: currentUserDecoratorContent
    }
];

files.forEach(f => {
    const fullPath = path.join(__dirname, f.path);
    if (fs.existsSync(fullPath)) {
        const bakPath = fullPath + '.bak';
        // Remove bak if exists
        if (fs.existsSync(bakPath)) {
            try { fs.unlinkSync(bakPath); } catch (e) { }
        }
        try {
            fs.renameSync(fullPath, bakPath);
            console.log('Renamed', f.path, 'to .bak');
        } catch (e) {
            console.error('Failed to rename', f.path, e);
        }
    }
    fs.writeFileSync(fullPath, f.content);
    console.log('Wrote', f.path);
});
