import { Injectable, Logger } from '@nestjs/common';
import { FingerprintDeviceService } from './fingerprint-device.service';
import { ScanResultDto } from '../dto/scan-result.dto';
import * as net from 'net';
import * as os from 'os';

@Injectable()
export class NetworkScannerService {
  private readonly logger = new Logger(NetworkScannerService.name);

  constructor(
    private readonly fingerprintDeviceService: FingerprintDeviceService,
  ) {}

  async scanSubnet(
    subnet?: string,
    port: number = 80,
  ): Promise<ScanResultDto[]> {
    const targetSubnet = subnet || this.getLocalSubnet();
    if (!targetSubnet) {
      throw new Error('Could not detect local subnet');
    }

    this.logger.log(`Scanning subnet: ${targetSubnet} on port ${port}`);
    const ips = this.generateIpRange(targetSubnet);
    const results: ScanResultDto[] = [];

    // Batch processing to avoid overwhelming network
    const batchSize = 20;
    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((ip) => this.scanIp(ip, port)),
      );
      results.push(...batchResults.filter((r) => r !== null));
    }

    return results;
  }

  private async scanIp(
    ip: string,
    port: number,
  ): Promise<ScanResultDto | null> {
    const isReachable = await this.pingDevice(ip, port);
    if (!isReachable) return null;

    let deviceInfo = null;
    try {
      const response = await this.fingerprintDeviceService.getDeviceInfo({
        ipAddress: ip,
        port,
        commKey: '0',
        timeout: 2000,
      });
      if (response.success) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        deviceInfo = response.data;
      }
    } catch {
      // Ignore error, just means we can't get info but it is reachable
    }

    return {
      ip_address: ip,
      port,
      isReachable: true,
      deviceInfo,
    };
  }

  private async pingDevice(ip: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, ip);
    });
  }

  private getLocalSubnet(): string | null {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const ifaces = interfaces[name];
      if (ifaces) {
        for (const iface of ifaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            // Simple assumption: /24 subnet
            const parts = iface.address.split('.');
            parts.pop();
            return `${parts.join('.')}.0/24`;
          }
        }
      }
    }
    return null;
  }

  private generateIpRange(subnet: string): string[] {
    const [baseIp, mask] = subnet.split('/');
    if (mask !== '24') {
      // Limited implementation for /24 only for now
      this.logger.warn('Only /24 subnet is fully supported for now');
    }

    const parts = baseIp.split('.');
    const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
    const ips: string[] = [];
    for (let i = 1; i < 255; i++) {
      ips.push(`${prefix}.${i}`);
    }
    return ips;
  }
}
