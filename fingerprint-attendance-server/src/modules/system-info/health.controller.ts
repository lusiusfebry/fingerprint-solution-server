import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SystemInfoService } from './system-info.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly systemInfoService: SystemInfoService) {}

  @Get()
  @ApiOperation({ summary: 'General health check' })
  async check() {
    return this.systemInfoService.getHealth();
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe' })
  async readiness() {
    // Basic connectivity check
    const health = await this.systemInfoService.getHealth();
    return { status: health.status, timestamp: new Date().toISOString() };
  }
}
