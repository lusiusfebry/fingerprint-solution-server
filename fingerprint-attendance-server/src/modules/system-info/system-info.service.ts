/* eslint-disable */
import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { DataSource } from 'typeorm';

@Injectable()
export class SystemInfoService {
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

     
    const totalEmployees = (await this.dataSource.query(
      'SELECT COUNT(*) as count FROM employees',
    )) as [{ count: string }];

     
    const totalLogs = (await this.dataSource.query(
      'SELECT COUNT(*) as count FROM attendance_logs',
    )) as [{ count: string }];

    // Last Backup
     
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
      cpu_usage: os.loadavg()[0],
      memory_usage: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: Math.round((usedMem / totalMem) * 100),
      },
      uptime: process.uptime(),
       
      last_backup: lastBackup[0]?.created_at || null,
      counts: {
         
        devices: parseInt(totalDevices[0].count),
         
        employees: parseInt(totalEmployees[0].count),
         
        logs: parseInt(totalLogs[0].count),
      },
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
