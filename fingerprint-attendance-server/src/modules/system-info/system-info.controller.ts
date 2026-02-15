import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemInfoService } from './system-info.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('System Info')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/system-info')
export class SystemInfoController {
  constructor(private readonly systemInfoService: SystemInfoService) {}

  @Get()
  @ApiOperation({ summary: 'Get system status and stats' })
  getSystemInfo() {
    return this.systemInfoService.getSystemInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return this.systemInfoService.getHealth();
  }
}
