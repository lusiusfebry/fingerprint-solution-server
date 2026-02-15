import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DevicesService } from '../devices.service'; // We will implement this next

@Injectable()
export class DeviceMonitorService {
  private readonly logger = new Logger(DeviceMonitorService.name);

  constructor(private readonly devicesService: DevicesService) {}

  @Cron('*/2 * * * *') // Every 2 minutes
  async checkDevicesStatus() {
    this.logger.debug('Starting device status check...');
    try {
      const devices = await this.devicesService.findAll();

      // Check in parallel with Promise.allSettled
      const results = await Promise.allSettled(
        devices.map((device) => this.devicesService.testConnection(device.id)),
      );

      this.logger.debug(`Checked ${results.length} devices.`);
    } catch (error) {
      this.logger.error(
        `Error monitoring devices: ${(error as Error).message}`,
      );
    }
  }
}
