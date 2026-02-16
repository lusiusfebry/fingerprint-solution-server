import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Daftar semua role',
    description:
      'Mendapatkan daftar seluruh role beserta permission yang terkait.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar role berhasil diambil',
    content: {
      'application/json': {
        example: [
          {
            id: 'uuid',
            name: 'Super Admin',
            description: 'Akses penuh ke sistem',
            permissions: [{ module: 'Devices', actions: ['create', 'read'] }],
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRoles() {
    return this.rolesService.findAllWithPermissions();
  }

  @Post()
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Buat role baru',
    description: 'Menambahkan tipe peran (role) baru ke dalam sistem.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Manager HR' },
        description: { type: 'string', example: 'Role untuk manajemen SDM' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Role berhasil dibuat',
    content: {
      'application/json': {
        example: { id: 'uuid', name: 'Manager HR', description: '...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nama role sudah ada',
    content: {
      'application/json': {
        example: { message: 'Role with name Manager HR already exists' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createRole(@Body() body: { name: string; description: string }) {
    return this.rolesService.createRole(body.name, body.description);
  }

  @Put(':id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Update detail role',
    description: 'Memperbarui nama atau deskripsi dari role yang sudah ada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Role (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Manager HR Senior' },
        description: {
          type: 'string',
          example: 'Role untuk manajemen SDM level senior',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role berhasil diperbarui',
    content: {
      'application/json': {
        example: { id: 'uuid', name: 'Manager HR Senior' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name: string; description: string },
  ) {
    return this.rolesService.updateRole(id, body.name, body.description);
  }

  @Put(':id/permissions')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Update hak akses (permissions)',
    description:
      'Mengatur ulang daftar modul dan aksi yang dapat diakses oleh role tertentu.',
  })
  @ApiParam({ name: 'id', description: 'ID Role (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              module: { type: 'string', example: 'Devices' },
              actions: {
                type: 'array',
                items: { type: 'string' },
                example: ['create', 'read', 'update'],
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions berhasil diperbarui',
    content: {
      'application/json': {
        example: { success: true, message: 'Permissions updated' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: { module: string; actions: string[] }[] },
  ) {
    return this.rolesService.updatePermissions(id, body.permissions);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Hapus role',
    description:
      'Menghapus role dari sistem (pastikan tidak ada user yang menggunakan role ini).',
  })
  @ApiParam({ name: 'id', description: 'ID Role (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role berhasil dihapus',
    content: {
      'application/json': {
        example: { message: 'Role deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
