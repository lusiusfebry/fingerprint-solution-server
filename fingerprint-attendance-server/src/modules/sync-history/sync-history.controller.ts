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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { ManualSyncDto } from './dto/manual-sync.dto';
import { BatchSyncDto } from './dto/batch-sync.dto';

@ApiTags('Sync History & Engine')
@Controller('api/sync')
export class SyncHistoryController {
  constructor(
    private readonly syncHistoryService: SyncHistoryService,
    private readonly syncEngineService: SyncEngineService,
    private readonly syncQueueService: SyncQueueService,
    private readonly syncSchedulerService: SyncSchedulerService,
  ) {}

  @Get('history')
  @ApiOperation({ summary: 'Get sync history with filters' })
  @ApiQuery({ name: 'deviceId', required: false })
  @ApiQuery({ name: 'syncType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
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
  @ApiOperation({ summary: 'Get sync history details' })
  async findOne(@Param('id') id: string) {
    return this.syncHistoryService.findOne(id);
  }

  @Get('history/device/:deviceId')
  @ApiOperation({ summary: 'Get sync history for specific device' })
  async findByDevice(
    @Param('deviceId') deviceId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.syncHistoryService.findByDevice(deviceId, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get sync statistics' })
  async getStatistics(@Query('deviceId') deviceId?: string) {
    return this.syncHistoryService.getStatistics(deviceId);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Trigger manual sync' })
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
  @ApiOperation({ summary: 'Trigger batch sync' })
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
  @ApiOperation({ summary: 'Retry failed sync' })
  async retrySync(@Param('id') id: string) {
    return this.syncEngineService.retryFailedSync(id);
  }

  @Get('queue/status')
  @ApiOperation({ summary: 'Get sync queue status' })
  async getQueueStatus() {
    return Promise.resolve(this.syncQueueService.getQueueStatus());
  }

  @Post('queue/clear')
  @ApiOperation({ summary: 'Clear sync queue' })
  async clearQueue() {
    this.syncQueueService.clearQueue();
    return Promise.resolve({ message: 'Queue cleared' });
  }

  @Get('scheduler/status')
  @ApiOperation({ summary: 'Get scheduler status' })
  async getSchedulerStatus() {
    return Promise.resolve(this.syncSchedulerService.getSchedulerStatus());
  }

  @Post('scheduler/start')
  @ApiOperation({ summary: 'Start sync scheduler' })
  async startScheduler() {
    this.syncSchedulerService.startScheduler();
    return Promise.resolve({ message: 'Scheduler started' });
  }

  @Post('scheduler/stop')
  @ApiOperation({ summary: 'Stop sync scheduler' })
  async stopScheduler() {
    this.syncSchedulerService.stopScheduler();
    return Promise.resolve({ message: 'Scheduler stopped' });
  }
}
