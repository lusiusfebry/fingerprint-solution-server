import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemInfoService } from './system-info.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('System')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/system-info')
export class SystemInfoController {
  constructor(private readonly systemInfoService: SystemInfoService) {}

  @Get()
  @ApiOperation({
    summary: 'Ambil status sistem',
    description:
      'Mendapatkan informasi dashboard sistem seperti jumlah mesin, karyawan, dan log terbaru.',
  })
  @ApiResponse({
    status: 200,
    description: 'Informasi sistem berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSystemInfo() {
    return this.systemInfoService.getSystemInfo();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Cek kesehatan aplikasi',
    description:
      'Melakukan pemeriksaan apakah sistem dan koneksi basis data berjalan dengan normal.',
  })
  @ApiResponse({ status: 200, description: 'Sistem sehat' })
  @ApiResponse({ status: 503, description: 'Sistem mengalami gangguan' })
  getHealth() {
    return this.systemInfoService.getHealth();
  }
}
