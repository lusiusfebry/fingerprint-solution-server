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

    const totalDevices = (await this.dataSource.query(
      'SELECT COUNT(*) as count FROM devices',
    )) as [{ count: string }];

    const onlineDevices = (await this.dataSource.query(
      "SELECT COUNT(*) as count FROM devices WHERE status = 'online'",
    )) as [{ count: string }];

    const totalEmployees = (await this.dataSource.query(
      'SELECT COUNT(*) as count FROM employees',
    )) as [{ count: string }];

    const totalLogs = (await this.dataSource.query(
      'SELECT COUNT(*) as count FROM attendance_logs',
    )) as [{ count: string }];

    const lastBackup = (await this.dataSource.query(
      'SELECT created_at FROM backup_history ORDER BY created_at DESC LIMIT 1',
    )) as [{ created_at: Date } | undefined];

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
          total: parseInt(totalDevices[0].count),
          online: parseInt(onlineDevices[0].count),
        },
        employees: parseInt(totalEmployees[0].count),
        logs: parseInt(totalLogs[0].count),
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
