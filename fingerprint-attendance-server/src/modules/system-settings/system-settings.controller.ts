import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/system-settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get all system settings' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(
    @Body() updateDto: UpdateSystemSettingsDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.settingsService.updateSettings(updateDto, req.user.userId);
  }
}
