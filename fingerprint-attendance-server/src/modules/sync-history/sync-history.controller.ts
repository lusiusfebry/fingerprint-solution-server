import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SyncHistoryService } from './sync-history.service';
import { SyncEngineService } from './services/sync-engine.service';
import { SyncQueueService } from './services/sync-queue.service';
import { SyncSchedulerService } from './services/sync-scheduler.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { ManualSyncDto } from './dto/manual-sync.dto';
import { BatchSyncDto } from './dto/batch-sync.dto';

@ApiTags('Sync History & Engine')
@Controller('api/sync')
@ApiBearerAuth('JWT-auth')
export class SyncHistoryController {
  constructor(
    private readonly syncHistoryService: SyncHistoryService,
    private readonly syncEngineService: SyncEngineService,
    private readonly syncQueueService: SyncQueueService,
    private readonly syncSchedulerService: SyncSchedulerService,
  ) {}

  @Get('history')
  @ApiOperation({
    summary: 'Ambil riwayat sinkronisasi',
    description:
      'Mendapatkan daftar log riwayat proses sinkronisasi dengan filter.',
  })
  @ApiQuery({
    name: 'deviceId',
    required: false,
    description: 'ID Perangkat (UUID)',
  })
  @ApiQuery({
    name: 'syncType',
    required: false,
    description: 'Tipe: pull_logs, push_employees, dll',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Status: success, failed, in_progress',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maksimal data yang diambil',
  })
  @ApiResponse({ status: 200, description: 'Daftar riwayat berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('deviceId') deviceId?: string,
    @Query('syncType') syncType?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    return this.syncHistoryService.findAll({
      deviceId,
      syncType,
      status,
      limit,
    });
  }

  @Get('history/:id')
  @ApiOperation({
    summary: 'Ambil detail riwayat',
    description:
      'Mendapatkan detail proses dan error (jika ada) dari satu entri riwayat sinkronisasi.',
  })
  @ApiParam({ name: 'id', description: 'ID Riwayat (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail riwayat ditemukan' })
  @ApiResponse({ status: 404, description: 'Riwayat tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.syncHistoryService.findOne(id);
  }

  @Get('history/device/:deviceId')
  @ApiOperation({
    summary: 'Riwayat per perangkat',
    description:
      'Mendapatkan log sinkronisasi terbaru untuk satu perangkat spesifik.',
  })
  @ApiParam({ name: 'deviceId', description: 'ID Perangkat (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Riwayat perangkat berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByDevice(
    @Param('deviceId') deviceId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.syncHistoryService.findByDevice(deviceId, limit);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Statistik sinkronisasi',
    description:
      'Mendapatkan ringkasan statistik (jumlah sukses/gagal) sinkronisasi.',
  })
  @ApiResponse({ status: 200, description: 'Statistik berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics(@Query('deviceId') deviceId?: string) {
    return this.syncHistoryService.getStatistics(deviceId);
  }

  @Post('manual')
  @ApiOperation({
    summary: 'Picu sinkronisasi manual',
    description:
      'Menjalankan proses sinkronisasi secara manual baik untuk satu mesin maupun seluruh mesin.',
  })
  @ApiResponse({ status: 201, description: 'Proses sinkronisasi dimulai' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async triggerManualSync(@Body() dto: ManualSyncDto) {
    const syncType = dto.syncType as
      | 'pull_logs'
      | 'push_employees'
      | 'push_templates'
      | 'sync_time'
      | 'full';

    if (dto.deviceId) {
      return this.syncEngineService.syncDevice(
        dto.deviceId,
        syncType,
        dto.conflictMode as 'server_override' | 'device_override',
      );
    } else {
      return this.syncEngineService.syncAllDevices(syncType);
    }
  }

  @Post('manual/batch')
  @ApiOperation({
    summary: 'Picu sinkronisasi batch',
    description:
      'Menjalankan sinkronisasi secara bersamaan untuk beberapa ID perangkat yang dipilih.',
  })
  @ApiResponse({ status: 201, description: 'Proses batch dimulai' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async triggerBatchSync(@Body() dto: BatchSyncDto) {
    const syncType = dto.syncType as
      | 'pull_logs'
      | 'push_employees'
      | 'push_templates'
      | 'sync_time'
      | 'full';

    return this.syncEngineService.syncMultipleDevices(dto.deviceIds, syncType);
  }

  @Post('retry/:id')
  @ApiOperation({
    summary: 'Coba ulang sinkronisasi',
    description: 'Mengulangi proses sinkronisasi yang sebelumnya gagal.',
  })
  @ApiParam({ name: 'id', description: 'ID Riwayat yang gagal (UUID)' })
  @ApiResponse({ status: 201, description: 'Percobaan ulang dimulai' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async retrySync(@Param('id') id: string) {
    return this.syncEngineService.retryFailedSync(id);
  }

  @Get('queue/status')
  @ApiOperation({
    summary: 'Status antrian sync',
    description:
      'Mendapatkan informasi jumlah antrian sinkronisasi yang sedang berjalan.',
  })
  @ApiResponse({ status: 200, description: 'Status antrian berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQueueStatus() {
    return Promise.resolve(this.syncQueueService.getQueueStatus());
  }

  @Post('queue/clear')
  @ApiOperation({
    summary: 'Bersihkan antrian',
    description:
      'Menghapus seluruh antrian proses sinkronisasi yang belum berjalan.',
  })
  @ApiResponse({ status: 201, description: 'Antrian berhasil dibersihkan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearQueue() {
    this.syncQueueService.clearQueue();
    return Promise.resolve({ message: 'Queue cleared' });
  }

  @Get('scheduler/status')
  @ApiOperation({
    summary: 'Status scheduler otomatis',
    description:
      'Mengecek apakah penjadwalan sinkronisasi otomatis sedang aktif atau tidak.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status scheduler berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSchedulerStatus() {
    return Promise.resolve(this.syncSchedulerService.getSchedulerStatus());
  }

  @Post('scheduler/start')
  @ApiOperation({
    summary: 'Mulai scheduler',
    description:
      'Mengaktifkan kembali sistem penjadwalan sinkronisasi otomatis.',
  })
  @ApiResponse({ status: 201, description: 'Scheduler diaktifkan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startScheduler() {
    this.syncSchedulerService.startScheduler();
    return Promise.resolve({ message: 'Scheduler started' });
  }

  @Post('scheduler/stop')
  @ApiOperation({
    summary: 'Hentikan scheduler',
    description:
      'Memberhentikan sistem penjadwalan sinkronisasi otomatis sementara.',
  })
  @ApiResponse({ status: 201, description: 'Scheduler dihentikan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stopScheduler() {
    this.syncSchedulerService.stopScheduler();
    return Promise.resolve({ message: 'Scheduler stopped' });
  }
}
