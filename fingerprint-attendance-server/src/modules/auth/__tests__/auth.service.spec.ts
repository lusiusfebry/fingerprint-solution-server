/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { CryptoUtil } from '../../../common/utils/crypto.util';

jest.mock('../../common/utils/crypto.util');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByUsername: jest.fn(),
    updateLastLogin: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_EXPIRATION') return '3600';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      return null;
    }),
  };

  const mockAuditLogsService = {
    createLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if valid', async () => {
      const user = {
        username: 'admin',
        password: 'hashed-password',
        is_active: true,
      };
      mockUsersService.findByUsername.mockResolvedValue(user);
      (CryptoUtil.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('admin', 'pass123');

      expect(result).not.toBeNull();
      if (result) {
        expect(result.password).toBeUndefined();
      }
    });

    it('should return null if invalid password', async () => {
      mockUsersService.findByUsername.mockResolvedValue({ is_active: true });
      (CryptoUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('admin', 'wrong-pass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and user info on success', async () => {
      const user = {
        id: 'u1',
        username: 'admin',
        role: { name: 'Admin', id: 'r1', permissions: [] },
      };
      jest.spyOn(service, 'validateUser').mockResolvedValue(user as any);
      jest.spyOn(service, 'generateTokens').mockReturnValue({
        access_token: 'at',
        refresh_token: 'rt',
      });

      const result = await service.login(
        { username: 'admin', password: 'p' },
        '127.0.0.1',
        'agent',
      );

      expect(result.access_token).toBe('at');
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith('u1');
      expect(mockAuditLogsService.createLog).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on failure', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login({ username: 'u', password: 'p' }, '', ''),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const payload = { sub: 'u1' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue({
        id: 'u1',
        is_active: true,
        role: {},
      });
      jest
        .spyOn(service, 'generateTokens')
        .mockReturnValue({ access_token: 'at2', refresh_token: 'rt2' });

      const result = await service.refreshToken({ refresh_token: 'old-rt' });

      expect(result.access_token).toBe('at2');
    });

    it('should throw UnauthorizedException if verify fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(
        service.refreshToken({ refresh_token: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
