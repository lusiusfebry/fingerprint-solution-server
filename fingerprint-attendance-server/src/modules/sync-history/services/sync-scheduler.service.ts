import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SyncEngineService } from './sync-engine.service';
import { SyncHistoryService } from '../sync-history.service';
import { Device } from '../../../database/entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronJob } from 'cron';

@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private isSchedulerRunning = true;
  private readonly AUTO_SYNC_JOB_NAME = 'autoSyncAllDevices';
  private readonly CLEANUP_JOB_NAME = 'cleanupOldHistory';

  constructor(
    private readonly syncEngineService: SyncEngineService,
    private readonly syncHistoryService: SyncHistoryService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  onModuleInit() {
    this.setupDynamicCron();
  }

  private setupDynamicCron() {
    // Auto-sync interval
    const intervalMinutes = this.configService.get<number>(
      'SYNC_INTERVAL_MINUTES',
      10,
    );
    const cronTime = `*/${intervalMinutes} * * * *`;

    try {
      // Remove existing if any (useful for restarts/reconfigs if we add a reconfig method)
      if (this.schedulerRegistry.getCronJobs().has(this.AUTO_SYNC_JOB_NAME)) {
        this.schedulerRegistry.deleteCronJob(this.AUTO_SYNC_JOB_NAME);
      }

      const autoSyncJob = new CronJob(cronTime, () => {
        void this.autoSyncAllDevices();
      });

      this.schedulerRegistry.addCronJob(this.AUTO_SYNC_JOB_NAME, autoSyncJob);
      autoSyncJob.start();
      this.logger.log(`Auto-sync cron scheduled for ${cronTime}`);
    } catch (error) {
      this.logger.error(
        `Failed to schedule auto-sync cron: ${(error as Error).message}`,
      );
    }

    // Daily cleanup job at midnight
    try {
      if (this.schedulerRegistry.getCronJobs().has(this.CLEANUP_JOB_NAME)) {
        this.schedulerRegistry.deleteCronJob(this.CLEANUP_JOB_NAME);
      }

      const cleanupJob = new CronJob(
        CronExpression.EVERY_DAY_AT_MIDNIGHT,
        () => {
          void this.cleanupOldHistory();
        },
      );

      this.schedulerRegistry.addCronJob(this.CLEANUP_JOB_NAME, cleanupJob);
      cleanupJob.start();
      this.logger.log('Cleanup cron scheduled for every day at midnight');
    } catch (error) {
      this.logger.error(
        `Failed to schedule cleanup cron: ${(error as Error).message}`,
      );
    }
  }

  async autoSyncAllDevices() {
    if (!this.isSchedulerRunning) return;

    const enabled = this.configService.get<boolean>(
      'SYNC_ENABLE_AUTO_SYNC',
      true,
    );
    if (!enabled) return;

    this.logger.log('Starting auto-sync for all online devices...');

    try {
      await this.syncEngineService.syncAllDevices('pull_logs');
    } catch (error) {
      this.logger.error(`Auto-sync failed: ${(error as Error).message}`);
    }
  }

  async cleanupOldHistory() {
    try {
      const days = this.configService.get<number>('SYNC_CLEANUP_DAYS', 90);
      this.logger.log(`Cleaning up sync history older than ${days} days...`);
      await this.syncHistoryService.deleteOldRecords(days);
    } catch (error) {
      this.logger.error(
        `Failed to cleanup old history: ${(error as Error).message}`,
      );
    }
  }

  startScheduler() {
    this.isSchedulerRunning = true;
    this.logger.log('Sync scheduler started');
    // If jobs were stopped, they should be restarted or re-setup
  }

  stopScheduler() {
    this.isSchedulerRunning = false;
    this.logger.log('Sync scheduler stopped');
  }

  getSchedulerStatus() {
    const intervalMinutes = this.configService.get<number>(
      'SYNC_INTERVAL_MINUTES',
      10,
    );
    return {
      running: this.isSchedulerRunning,
      autoSyncEnabled: this.configService.get<boolean>(
        'SYNC_ENABLE_AUTO_SYNC',
        true,
      ),
      interval: `${intervalMinutes} minutes`,
    };
  }
}
