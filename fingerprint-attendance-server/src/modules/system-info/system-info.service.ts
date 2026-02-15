import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { Connection } from 'typeorm';

@Injectable()
export class SystemInfoService {
  constructor(private connection: Connection) {}

  async getSystemInfo() {
    // DB Status
    let dbStatus = 'disconnected';
    try {
      if (this.connection.isConnected) dbStatus = 'connected';
    } catch {
      // ignore
    }

    // Counts

    const totalDevices = await this.connection.query(
      'SELECT COUNT(*) as count FROM devices',
    );

    const totalEmployees = await this.connection.query(
      'SELECT COUNT(*) as count FROM employees',
    );

    const totalLogs = await this.connection.query(
      'SELECT COUNT(*) as count FROM attendance_logs',
    );

    // Last Backup

    const lastBackup = await this.connection.query(
      'SELECT created_at FROM backup_history ORDER BY created_at DESC LIMIT 1',
    );

    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      server_status: 'online',
      version: process.env.npm_package_version || '1.0.0',
      database_status: dbStatus,
      cpu_usage: os.loadavg()[0], // 1 min load avg
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
