import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('System')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/system-settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({
    summary: 'Ambil semua pengaturan',
    description:
      'Mendapatkan konfigurasi sistem saat ini seperti nama aplikasi, interval sinkronisasi, dan kebijakan konflik.',
  })
  @ApiResponse({ status: 200, description: 'Pengaturan berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Update pengaturan sistem',
    description:
      'Memperbarui parameter konfigurasi sistem. Perubahan akan dicatat dalam audit trail.',
  })
  @ApiResponse({ status: 200, description: 'Pengaturan berhasil diperbarui' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSettings(
    @Body() updateDto: UpdateSystemSettingsDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.settingsService.updateSettings(updateDto, req.user.userId);
  }
}
