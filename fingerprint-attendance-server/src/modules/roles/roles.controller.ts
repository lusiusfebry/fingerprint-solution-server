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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Roles Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'List all roles with permissions' })
  async getRoles() {
    return this.rolesService.findAllWithPermissions();
  }

  @Post()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Create new role' })
  async createRole(@Body() body: { name: string; description: string }) {
    return this.rolesService.createRole(body.name, body.description);
  }

  @Put(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Update role details' })
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name: string; description: string },
  ) {
    return this.rolesService.updateRole(id, body.name, body.description);
  }

  @Put(':id/permissions')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Update role permissions' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: { module: string; actions: string[] }[] },
  ) {
    return this.rolesService.updatePermissions(id, body.permissions);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
