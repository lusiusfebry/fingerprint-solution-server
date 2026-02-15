/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncHistory } from '../../database/entities/sync-history.entity';
import { Device } from '../../database/entities/device.entity';

@Injectable()
export class SyncHistoryService {
  private readonly logger = new Logger(SyncHistoryService.name);

  constructor(
    @InjectRepository(SyncHistory)
    private readonly syncHistoryRepository: Repository<SyncHistory>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) { }

  async create(
    deviceId: string,
    syncType: string,
    status: string,
    recordsCount: number = 0,
    errorMessage?: string,
  ): Promise<SyncHistory> {
    try {
      const history = this.syncHistoryRepository.create({
        device_id: deviceId,
        sync_type: syncType,
        status: status,
        records_count: recordsCount,
        error_message: errorMessage,
        timestamp: new Date(),
      });

      return await this.syncHistoryRepository.save(history);
    } catch (error) {
      this.logger.error(
        `Failed to create sync history for device ${deviceId}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll(
    filters: {
      deviceId?: string;
      syncType?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<SyncHistory[]> {
    const query = this.syncHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.device', 'device')
      .orderBy('history.timestamp', 'DESC');

    if (filters.deviceId) {
      query.andWhere('history.device_id = :deviceId', {
        deviceId: filters.deviceId,
      });
    }

    if (filters.syncType) {
      query.andWhere('history.sync_type = :syncType', {
        syncType: filters.syncType,
      });
    }

    if (filters.status) {
      query.andWhere('history.status = :status', { status: filters.status });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('history.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.limit) {
      query.take(filters.limit);
    }

    if (filters.offset) {
      query.skip(filters.offset);
    }

    return query.getMany();
  }

  async findByDevice(
    deviceId: string,
    limit: number = 20,
  ): Promise<SyncHistory[]> {
    return this.syncHistoryRepository.find({
      where: { device_id: deviceId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async findRecent(limit: number = 50): Promise<SyncHistory[]> {
    return this.syncHistoryRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
      relations: ['device'],
    });
  }

  async getStatistics(
    deviceId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalSyncs: number;
    successRate: number;
    failedCount: number;
    totalRecordsSynced: number;
  }> {
    const query = this.syncHistoryRepository.createQueryBuilder('history');

    if (deviceId) {
      query.andWhere('history.device_id = :deviceId', { deviceId });
    }

    if (startDate && endDate) {
      query.andWhere('history.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalSyncs = await query.getCount();
    const successCount = await query
      .clone()
      .andWhere("history.status = 'success'")
      .getCount();
    const failedCount = await query
      .clone()
      .andWhere("history.status = 'failed'")
      .getCount();

    const totalRecordsResult = await query
      .clone()
      .select('SUM(history.records_count)', 'total')
      .getRawOne();
    return {
      totalSyncs,
      successRate: totalSyncs > 0 ? (successCount / totalSyncs) * 100 : 0,
      failedCount,
      totalRecordsSynced: totalRecordsResult
        ? parseInt(totalRecordsResult.total, 10) || 0
        : 0,
    };
  }

  async deleteOldRecords(daysToKeep: number = 90): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysToKeep);

    const result = await this.syncHistoryRepository
      .createQueryBuilder()
      .delete()
      .from(SyncHistory)
      .where('timestamp < :date', { date })
      .execute();

    this.logger.log(`Deleted ${result.affected} old sync history records.`);
  }

  async findOne(id: string): Promise<SyncHistory | null> {
    return this.syncHistoryRepository.findOne({
      where: { id },
      relations: ['device'],
    });
  }
}
