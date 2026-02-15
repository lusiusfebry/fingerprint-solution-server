/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { TcpSocketService } from './tcp-socket.service';
import type {
  IDeviceResponse,
  // IAttendanceLog,
  // IFingerprintTemplate,
  // IDeviceInfo,
} from '../interfaces/device-response.interface';
import type { IConnectionConfig } from '../interfaces/connection-config.interface';
import { SoapBuilder } from '../../../common/utils/soap-builder.util';
import { XmlParser } from '../../../common/utils/xml-parser.util';
import { Retry } from '../../../common/decorators/retry.decorator';

@Injectable()
export class FingerprintDeviceService {
  private readonly logger = new Logger(FingerprintDeviceService.name);

  constructor(private readonly tcpSocketService: TcpSocketService) { }

  /**
   * Core Connection Methods
   */
  @Retry()
  async connect(config: IConnectionConfig): Promise<IDeviceResponse> {
    try {
      this.logger.debug(`Connecting to device ${config.ipAddress}...`);
      const isConnected = await this.tcpSocketService.testConnection(
        config.ipAddress,
        config.port,
      );

      if (isConnected) {
        return { success: true, message: 'Terhubung ke device' };
      } else {
        return { success: false, message: 'Gagal terhubung ke device' };
      }
    } catch (error) {
      this.logger.error(`Connection failed: ${(error as Error).message}`);
      return { success: false, message: (error as Error).message };
    }
  }

  async disconnect(_config: IConnectionConfig): Promise<IDeviceResponse> {
    // Protocol is connection-less (HTTP over TCP), so effectively we are always disconnected after request
    return Promise.resolve({ success: true, message: 'Disconnected' });
  }

  async testConnection(
    ipAddress: string,
    port: number,
  ): Promise<IDeviceResponse> {
    const start = Date.now();
    const isConnected = await this.tcpSocketService.testConnection(
      ipAddress,
      port,
    );
    const duration = Date.now() - start;

    return {
      success: isConnected,
      message: isConnected ? 'Koneksi berhasil' : 'Koneksi gagal',
      data: { responseTime: duration },
    };
  }

  @Retry()
  async getDeviceInfo(config: IConnectionConfig): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildGetDeviceInfo(
        config.commKey,
        'DeviceName',
      );
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseDeviceInfo(response) as Record<string, any>;

      return {
        success: true,
        message: 'Device Info Retrieved',
        data: info,
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async restartDevice(config: IConnectionConfig): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildRestart(config.commKey);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);
      return { success: true, message: info || 'Restart command sent' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Attendance Operations
   */
  @Retry()
  async downloadAttendanceLogs(
    config: IConnectionConfig,
    pin: string = 'All',
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildGetAttLog(config.commKey, pin);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const logs = XmlParser.parseAttendanceLogs(response) as any[];

      this.logger.log(
        `Downloaded ${logs.length} logs from ${config.ipAddress}`,
      );

      return {
        success: true,
        message: `Berhasil mengambil ${logs.length} data absensi`,
        data: logs,
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async clearAttendanceLogs(
    config: IConnectionConfig,
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildClearData(config.commKey, 3);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        this.logger.warn(`Cleared attendance logs on ${config.ipAddress}`);
        return { success: true, message: 'Data absensi berhasil dihapus' };
      }
      return {
        success: false,
        message: info || 'Gagal menghapus data absensi',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Employee Operations
   */
  @Retry()
  async uploadEmployee(
    config: IConnectionConfig,
    pin: string,
    name: string,
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildSetUserInfo(config.commKey, pin, name);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        this.logger.log(`Uploaded employee ${pin} to ${config.ipAddress}`);
        return { success: true, message: 'Data karyawan berhasil diupload' };
      }
      return { success: false, message: info || 'Gagal upload data karyawan' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async deleteEmployee(
    config: IConnectionConfig,
    pin: string,
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildDeleteUser(config.commKey, pin);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        this.logger.log(`Deleted employee ${pin} from ${config.ipAddress}`);
        return { success: true, message: 'Data karyawan berhasil dihapus' };
      }
      return {
        success: false,
        message: info || 'Gagal menghapus data karyawan',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Fingerprint Operations
   */
  @Retry()
  async uploadFingerprintTemplate(
    config: IConnectionConfig,
    pin: string,
    fingerId: number,
    template: string,
  ): Promise<IDeviceResponse> {
    try {
      if (!template) {
        throw new Error('Template tidak boleh kosong');
      }

      const soapXml = SoapBuilder.buildSetUserTemplate(
        config.commKey,
        pin,
        fingerId,
        template,
      );
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        await this.refreshDatabase(config); // Important: Refresh DB after template upload
        this.logger.log(
          `Uploaded template for ${pin} (Finger ${fingerId}) to ${config.ipAddress}`,
        );
        return {
          success: true,
          message: 'Template sidik jari berhasil diupload',
        };
      }
      return {
        success: false,
        message: info || 'Gagal upload template sidik jari',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  @Retry()
  async downloadFingerprintTemplate(
    config: IConnectionConfig,
    pin: string,
    fingerId: number,
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildGetUserTemplate(
        config.commKey,
        pin,
        fingerId,
      );
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const templates = XmlParser.parseFingerprintTemplates(response) as any[];

      if (templates.length > 0) {
        return {
          success: true,
          message: 'Template ditemukan',
          data: templates[0],
        };
      }
      return { success: false, message: 'Template tidak ditemukan' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async deleteFingerprintTemplate(
    config: IConnectionConfig,
    pin: string,
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildDeleteTemplate(config.commKey, pin);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        await this.refreshDatabase(config);
        this.logger.log(
          `Deleted templates for ${pin} from ${config.ipAddress}`,
        );
        return {
          success: true,
          message: 'Template sidik jari berhasil dihapus',
        };
      }
      return {
        success: false,
        message: info || 'Gagal menghapus template sidik jari',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Utility Operations
   */
  async syncTime(
    config: IConnectionConfig,
    dateTime?: Date,
  ): Promise<IDeviceResponse> {
    try {
      const now = dateTime || new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const soapXml = SoapBuilder.buildSetDate(
        config.commKey,
        dateStr,
        timeStr,
      );
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        return {
          success: true,
          message: `Waktu berhasil disinkronisasi ke ${dateStr} ${timeStr}`,
        };
      }
      return { success: false, message: info || 'Gagal sinkronisasi waktu' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async clearData(
    config: IConnectionConfig,
    dataType: number = 3,
  ): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildClearData(config.commKey, dataType);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const info = XmlParser.parseInformation(response);

      if (info.includes('Succeed') || info.includes('OK')) {
        return { success: true, message: 'Data berhasil dibersihkan' };
      }
      return { success: false, message: info || 'Gagal membersihkan data' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  @Retry()
  async downloadEmployees(config: IConnectionConfig): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildGetUserInfo(config.commKey);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const employees = XmlParser.parseUsers(response);

      return {
        success: true,
        message: `Berhasil mengambil ${employees.length} data karyawan`,
        data: employees,
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  @Retry()
  async downloadTemplates(config: IConnectionConfig): Promise<IDeviceResponse> {
    try {
      const soapXml = SoapBuilder.buildGetAllUserTemplate(config.commKey);
      const response = await this.tcpSocketService.sendSoapRequest(
        config,
        soapXml,
      );
      const templates = XmlParser.parseFingerprintTemplates(response);

      return {
        success: true,
        message: `Berhasil mengambil ${templates.length} template sidik jari`,
        data: templates,
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  private async refreshDatabase(config: IConnectionConfig): Promise<void> {
    try {
      const soapXml = SoapBuilder.buildRefreshDB(config.commKey);
      await this.tcpSocketService.sendSoapRequest(config, soapXml);
    } catch (error) {
      this.logger.warn(
        `Failed to auto-refresh DB on ${config.ipAddress}: ${(error as Error).message}`,
      );
    }
  }
}
