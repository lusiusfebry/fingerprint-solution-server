import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SyncJob {
  id: string;
  deviceId: string;
  syncType:
    | 'pull_logs'
    | 'push_employees'
    | 'push_templates'
    | 'sync_time'
    | 'full';
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  conflictMode?: 'server_override' | 'device_override';
}

@Injectable()
export class SyncQueueService {
  private readonly logger = new Logger(SyncQueueService.name);
  private jobs: Map<string, SyncJob> = new Map();
  private processing: Set<string> = new Set();

  constructor(private eventEmitter: EventEmitter2) {}

  addJob(
    deviceId: string,
    syncType: SyncJob['syncType'],
    priority: number = 0,
    conflictMode: 'server_override' | 'device_override' = 'server_override',
  ): string {
    // Prevent duplicate pending jobs for same device and type
    for (const job of this.jobs.values()) {
      if (
        job.deviceId === deviceId &&
        job.syncType === syncType &&
        job.status === 'pending'
      ) {
        this.logger.debug(
          `Job already exists for device ${deviceId} type ${syncType}`,
        );
        return job.id;
      }
    }

    const id = Math.random().toString(36).substring(7);
    const job: SyncJob = {
      id,
      deviceId,
      syncType,
      priority,
      status: 'pending',
      createdAt: new Date(),
      conflictMode,
    };

    this.jobs.set(id, job);
    this.emitUpdate();
    this.logger.debug(
      `Added job ${id} for device ${deviceId} type ${syncType}`,
    );
    return id;
  }

  getNextJob(): SyncJob | undefined {
    const pendingJobs = Array.from(this.jobs.values())
      .filter((j) => j.status === 'pending')
      .sort(
        (a, b) =>
          b.priority - a.priority ||
          a.createdAt.getTime() - b.createdAt.getTime(),
      );

    if (pendingJobs.length > 0) {
      // Check if device is already processing another job
      for (const job of pendingJobs) {
        if (!this.isDeviceProcessing(job.deviceId)) {
          return job;
        }
      }
    }
    return undefined;
  }

  private isDeviceProcessing(deviceId: string): boolean {
    return Array.from(this.jobs.values()).some(
      (j) => j.deviceId === deviceId && j.status === 'processing',
    );
  }

  markJobProcessing(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'processing';
      job.startedAt = new Date();
      this.processing.add(jobId);
      this.emitUpdate();
    }
  }

  markJobCompleted(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.completedAt = new Date();
      this.processing.delete(jobId);

      // Auto cleanup completed jobs after some time or immediately
      setTimeout(() => {
        this.jobs.delete(jobId);
        this.emitUpdate();
      }, 60000); // Keep for 1 min

      this.emitUpdate();
    }
  }

  markJobFailed(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = error;
      this.processing.delete(jobId);
      // Auto cleanup failed jobs
      setTimeout(() => {
        this.jobs.delete(jobId);
        this.emitUpdate();
      }, 300000); // Keep for 5 min
      this.emitUpdate();
    }
  }

  getQueueStatus() {
    const jobs = Array.from(this.jobs.values());
    return {
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      total: jobs.length,
    };
  }

  clearQueue(): void {
    this.jobs.clear();
    this.processing.clear();
    this.emitUpdate();
  }

  getJobsByDevice(deviceId: string): SyncJob[] {
    return Array.from(this.jobs.values()).filter(
      (j) => j.deviceId === deviceId,
    );
  }

  private emitUpdate() {
    this.eventEmitter.emit('sync.queue.update', this.getQueueStatus());
  }
}
