import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupHistory } from '../../database/entities/backup-history.entity';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as cronParser from 'cron-parser';
import { SystemSettingsService } from '../system-settings/system-settings.service';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(BackupHistory)
    private backupRepository: Repository<BackupHistory>,
    private configService: ConfigService,
    private systemSettingsService: SystemSettingsService,
  ) {
    void this.ensureBackupDir();
  }

  private async ensureBackupDir() {
    if (!existsSync(this.backupDir)) {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const settings = await this.systemSettingsService.getSettings();

      if (!settings.auto_backup_enabled || !settings.backup_schedule) {
        return;
      }

      // Check if we should run now
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const interval: any = (cronParser as any).parseExpression(
        settings.backup_schedule,
        { currentDate: new Date() },
      );

      // Get the last scheduled time (prev) relative to now
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const prev = interval.prev().toDate() as Date;
      const now = new Date();

      // Grace period: if we are within 5 minutes of the scheduled time
      const diffMs = now.getTime() - prev.getTime();
      const fiveMinutesMs = 5 * 60 * 1000;

      if (diffMs > fiveMinutesMs) {
        // Too late, skip
        return;
      }

      // Check if we already ran a backup after the scheduled time
      const lastAutoBackup = await this.backupRepository.findOne({
        where: { type: 'auto' },
        order: { created_at: 'DESC' },
      });

      if (lastAutoBackup && lastAutoBackup.created_at >= prev) {
        // Already executed for this slot
        return;
      }

      this.logger.log(
        `Triggering auto-backup scheduled at ${prev.toISOString()}`,
      );
      await this.createBackup('system', 'auto');
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error in auto-backup cron:', err.message);
    }
  }

  async getBackupHistory(page = 1, limit = 10) {
    const [data, total] = await this.backupRepository.findAndCount({
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }

  async createBackup(userId: string, type: 'manual' | 'auto' = 'manual') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    const dbPort = this.configService.get<string>('DB_PORT', '5432');
    const dbUser = this.configService.get<string>('DB_USERNAME', 'postgres');
    const dbPass = this.configService.get<string>('DB_PASSWORD', 'postgres');
    const dbName = this.configService.get<string>(
      'DB_DATABASE',
      'attendance_db',
    );

    // Set password via env var for pg_dump
    const env = { ...process.env, PGPASSWORD: dbPass };

    const command = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -b -v -f "${filePath}" ${dbName}`;

    try {
      await execAsync(command, { env });

      const stats = await fs.stat(filePath);

      const backup = this.backupRepository.create({
        filename,
        file_path: filePath,
        size_bytes: stats.size,
        type,
        status: 'success',
        created_by: userId,
      });

      return await this.backupRepository.save(backup);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Backup failed: ${err.message}`, err.stack);

      // Record failure
      await this.backupRepository.save({
        filename,
        file_path: filePath,
        size_bytes: 0,
        type,
        status: 'failed',
        created_by: userId,
      });

      throw new InternalServerErrorException(`Backup failed: ${err.message}`);
    }
  }

  async restoreBackup(id: string) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('Backup not found');

    if (!existsSync(backup.file_path))
      throw new NotFoundException('Backup file not found on disk');

    const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    const dbPort = this.configService.get<string>('DB_PORT', '5432');
    const dbUser = this.configService.get<string>('DB_USERNAME', 'postgres');
    const dbPass = this.configService.get<string>('DB_PASSWORD', 'postgres');
    const dbName = this.configService.get<string>(
      'DB_DATABASE',
      'attendance_db',
    );

    const env = { ...process.env, PGPASSWORD: dbPass };

    // pg_restore with -c (clean) to drop objects before creating them
    const command = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c -v "${backup.file_path}"`;

    try {
      await execAsync(command, { env });
      return { message: 'Database restored successfully', backup_id: id };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Restore failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Restore failed: ${err.message}`);
    }
  }

  async deleteBackup(id: string) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('Backup not found');

    try {
      if (existsSync(backup.file_path)) {
        await fs.unlink(backup.file_path);
      }
      await this.backupRepository.remove(backup);
      return { message: 'Backup deleted successfully' };
    } catch (error) {
      const err = error as Error;
      throw new InternalServerErrorException(`Delete failed: ${err.message}`);
    }
  }

  async getBackupFileStream(id: string) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('Backup not found');

    if (!existsSync(backup.file_path))
      throw new NotFoundException('Backup file not found on disk');

    return {
      stream: createReadStream(backup.file_path),
      filename: backup.filename,
      size: backup.size_bytes,
    };
  }
}
