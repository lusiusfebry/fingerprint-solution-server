import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Backup & Restore')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('history')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Riwayat backup',
    description:
      'Mendapatkan daftar riwayat proses backup basis data yang telah dilakukan.',
  })
  @ApiResponse({ status: 200, description: 'Riwayat backup berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getHistory(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.backupService.getBackupHistory(Number(page), Number(limit));
  }

  @Post('create')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Picu backup manual',
    description:
      'Menjalankan proses backup basis data secara instan dan menyimpannya di server.',
  })
  @ApiResponse({ status: 201, description: 'Backup berhasil dibuat' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBackup(@Request() req: { user: { userId: string } }) {
    return this.backupService.createBackup(req.user.userId, 'manual');
  }

  @Post('restore/:id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Restore basis data',
    description:
      'Mengembalikan (restore) kondisi basis data menggunakan file cadangan tertentu.',
  })
  @ApiParam({ name: 'id', description: 'ID Backup (UUID)' })
  @ApiResponse({ status: 201, description: 'Basis data berhasil dipulihkan' })
  @ApiResponse({ status: 404, description: 'File backup tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restoreBackup(@Param('id') id: string) {
    return this.backupService.restoreBackup(id);
  }

  @Delete('delete/:id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Hapus file backup',
    description:
      'Menghapus catatan riwayat dan file backup fisik dari penyimpanan server.',
  })
  @ApiParam({ name: 'id', description: 'ID Backup (UUID)' })
  @ApiResponse({ status: 200, description: 'File backup berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Backup tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteBackup(@Param('id') id: string) {
    return this.backupService.deleteBackup(id);
  }

  @Get('download/:id')
  @Roles('Super Admin')
  @ApiOperation({
    summary: 'Download file backup',
    description: 'Mengunduh file fisik cadangan basis data (.sql/zip).',
  })
  @ApiParam({ name: 'id', description: 'ID Backup (UUID)' })
  @ApiResponse({ status: 200, description: 'Download dimulai' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async downloadBackup(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename, size } =
      await this.backupService.getBackupFileStream(id);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': size,
    });

    return new StreamableFile(stream);
  }
}
