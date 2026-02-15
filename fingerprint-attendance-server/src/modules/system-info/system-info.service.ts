/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import { DataSource } from 'typeorm';
import { Device } from '../../database/entities/device.entity';

@Injectable()
export class SystemInfoService {
  private readonly logger = new Logger(SystemInfoService.name);

  constructor(private dataSource: DataSource) { }

  async getSystemInfo() {
    let dbStatus = 'disconnected';
    try {
      if (this.dataSource.isInitialized) dbStatus = 'connected';
    } catch {
      // ignore
    }

    let totalDevices = [{ count: '0' }];
    try {
      totalDevices = await this.dataSource.query('SELECT COUNT(*) as count FROM devices');
    } catch (e) {
      this.logger.error('Error fetching total devices:', e);
    }

    let onlineDevices = [{ count: '0' }];
    try {
      onlineDevices = await this.dataSource.query("SELECT COUNT(*) as count FROM devices WHERE status = 'online'");
    } catch (e) {
      this.logger.error('Error fetching online devices:', e);
    }

    let totalEmployees = [{ count: '0' }];
    try {
      totalEmployees = await this.dataSource.query('SELECT COUNT(*) as count FROM employees');
    } catch (e) {
      this.logger.error('Error fetching total employees:', e);
    }

    let totalLogs = [{ count: '0' }];
    try {
      totalLogs = await this.dataSource.query('SELECT COUNT(*) as count FROM attendance_logs');
    } catch (e) {
      this.logger.error('Error fetching total logs:', e);
    }

    let lastBackup = [{ created_at: null }];
    try {
      lastBackup = await this.dataSource.query('SELECT created_at FROM backup_history ORDER BY created_at DESC LIMIT 1');
    } catch (e) {
      this.logger.error('Error fetching last backup:', e);
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      server_status: 'online',
      version: process.env.npm_package_version || '1.0.0',
      database_status: dbStatus,
      cpu_usage_avg: os.loadavg()[0],
      memory_usage: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: Math.round((usedMem / totalMem) * 100),
      },
      uptime: process.uptime(),
      os_info: {
        platform: os.platform(),
        release: os.release(),
        type: os.type(),
      },
      last_backup: lastBackup[0]?.created_at || null,
      counts: {
        devices: {
          total: parseInt(totalDevices[0]?.count || '0'),
          online: parseInt(onlineDevices[0]?.count || '0'),
        },
        employees: parseInt(totalEmployees[0]?.count || '0'),
        logs: parseInt(totalLogs[0]?.count || '0'),
      },
    };
  }

  async getHealth() {
    let dbStatus = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch (e) {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus },
        storage: { status: 'ok' }, // Add logic for disk check if needed
      },
      system: {
        load_avg: os.loadavg(),
        free_mem: os.freemem(),
      }
    };
  }
}
