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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Backup & Restore')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('history')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Get backup history' })
  async getHistory(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.backupService.getBackupHistory(Number(page), Number(limit));
  }

  @Post('create')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Trigger manual backup' })
  async createBackup(@Request() req: { user: { userId: string } }) {
    return this.backupService.createBackup(req.user.userId, 'manual');
  }

  @Post('restore/:id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Restore database from backup' })
  async restoreBackup(@Param('id') id: string) {
    return this.backupService.restoreBackup(id);
  }

  @Delete('delete/:id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete a backup' })
  async deleteBackup(@Param('id') id: string) {
    return this.backupService.deleteBackup(id);
  }

  @Get('download/:id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Download backup file' })
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
