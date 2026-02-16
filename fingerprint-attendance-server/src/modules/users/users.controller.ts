import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Buat user baru (Admin Only)',
    description:
      'Mendaftarkan akun pengguna baru ke dalam sistem. Terbatas hanya untuk Super Admin.',
  })
  @ApiResponse({
    status: 201,
    description: 'User berhasil dibuat',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Username atau email sudah digunakan',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Membutuhkan akses Super Admin',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Ambil semua user',
    description: 'Mendapatkan daftar lengkap semua akun pengguna dalam sistem.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar user berhasil diambil',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Ambil detail user',
    description: 'Mendapatkan informasi detail akun pengguna berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID User (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Data user ditemukan',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Update user',
    description: 'Memperbarui profil atau status aktif dari akun pengguna.',
  })
  @ApiParam({ name: 'id', description: 'ID User (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'User berhasil diperbarui',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/change-password')
  @ApiOperation({
    summary: 'Ganti password user',
    description:
      'Memperbarui password akun. Pengguna hanya bisa mengganti password miliknya sendiri, kecuali Super Admin.',
  })
  @ApiParam({ name: 'id', description: 'ID User (UUID)' })
  @ApiResponse({ status: 200, description: 'Password berhasil diperbarui' })
  @ApiResponse({
    status: 400,
    description: 'Password lama tidak cocok atau hak akses tidak sah',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    if (id !== user.id && user.role.name !== 'Super Admin') {
      throw new BadRequestException('You can only change your own password');
    }
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus user (Soft Delete)',
    description: 'Menonaktifkan dan menghapus user secara logis dari sistem.',
  })
  @ApiParam({ name: 'id', description: 'ID User (UUID)' })
  @ApiResponse({ status: 204, description: 'User berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.usersService.remove(id, user);
  }
}
