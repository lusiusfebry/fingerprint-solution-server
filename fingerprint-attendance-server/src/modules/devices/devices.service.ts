import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { FingerprintDeviceService } from './services/fingerprint-device.service';
import { DevicesGateway } from './devices.gateway';
import { NetworkScannerService } from './services/network-scanner.service';
import { SyncDeviceDto, SyncType } from './dto/sync-device.dto';
import { IConnectionConfig } from './interfaces/connection-config.interface';
import { IDeviceResponse } from './interfaces/device-response.interface';

import { AttendanceLogsService } from '../attendance-logs/attendance-logs.service';
import { EmployeesService } from '../employees/employees.service';
import { SyncEngineService } from '../sync-history/services/sync-engine.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly fingerprintService: FingerprintDeviceService,
    private readonly devicesGateway: DevicesGateway,
    private readonly networkScanner: NetworkScannerService,
    private readonly attendanceLogsService: AttendanceLogsService,
    private readonly employeesService: EmployeesService,
    @Inject(forwardRef(() => SyncEngineService))
    private readonly syncEngineService: SyncEngineService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // Check duplicate serial number
    const existing = await this.deviceRepository.findOne({
      where: { serial_number: createDeviceDto.serial_number },
    });
    if (existing) {
      throw new BadRequestException(
        'Device with this serial number already exists',
      );
    }

    // Validate connection
    const config: IConnectionConfig = {
      ipAddress: createDeviceDto.ip_address,
      port: createDeviceDto.port || 4370,
      commKey: createDeviceDto.comm_key || '0',
      timeout: 3000,
    };

    const connectionTest = await this.fingerprintService.testConnection(
      config.ipAddress,
      config.port,
    );

    if (!connectionTest.success) {
      this.logger.warn(`Registering offline device: ${createDeviceDto.name}`);
    }

    const device = this.deviceRepository.create({
      ...createDeviceDto,
      status: connectionTest.success ? 'online' : 'offline',
    });

    const savedDevice = await this.deviceRepository.save(device);
    this.devicesGateway.emitDeviceAdded(savedDevice);
    return savedDevice;
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    await this.findOne(id);

    // If IP/Port changed, verify connection (optional but good practice)
    if (updateDeviceDto.ip_address || updateDeviceDto.port) {
      // Logic to verify new connection params could go here
    }

    await this.deviceRepository.update(id, updateDeviceDto);
    const updatedDevice = await this.findOne(id);
    this.devicesGateway.emitDeviceUpdated(updatedDevice);
    return updatedDevice;
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.deviceRepository.remove(device); // or soft delete
    this.devicesGateway.emitDeviceDeleted(id);
  }

  /**
   * Device Operations
   */

  private getConnectionConfig(device: Device): IConnectionConfig {
    return {
      ipAddress: device.ip_address,
      port: device.port,
      commKey: device.comm_key || '0',
      timeout: 5000,
    };
  }

  async testConnection(id: string): Promise<IDeviceResponse> {
    const device = await this.findOne(id);
    const config = this.getConnectionConfig(device);

    const result = await this.fingerprintService.testConnection(
      config.ipAddress,
      config.port,
    );

    // Update status
    const newStatus = result.success ? 'online' : 'offline';
    if (device.status !== newStatus) {
      device.status = newStatus;
      await this.deviceRepository.save(device);
      this.devicesGateway.emitDeviceStatusUpdate(
        device.id,
        newStatus,
        result.success,
      );
    }

    return result;
  }

  async restartDevice(id: string): Promise<IDeviceResponse> {
    const device = await this.findOne(id);
    const config = this.getConnectionConfig(device);
    return this.fingerprintService.restartDevice(config);
  }

  async getDeviceInfo(id: string): Promise<IDeviceResponse> {
    const device = await this.findOne(id);
    const config = this.getConnectionConfig(device);
    return this.fingerprintService.getDeviceInfo(config);
  }

  async syncDevice(
    id: string,
    syncDto: SyncDeviceDto,
  ): Promise<{ jobId: string; status: string }> {
    // Delegate to SyncEngineService
    // Map old SyncType to new string types if necessary, or ensure they match
    // Assuming SyncType enum matches expectations or mapped
    let engineSyncType:
      | 'pull_logs'
      | 'push_employees'
      | 'push_templates'
      | 'sync_time'
      | 'full';

    switch (syncDto.sync_type) {
      case SyncType.PULL_LOGS:
        engineSyncType = 'pull_logs';
        break;
      case SyncType.PUSH_EMPLOYEES:
        engineSyncType = 'push_employees';
        break;
      case SyncType.PUSH_TEMPLATES:
        engineSyncType = 'push_templates';
        break; // Assuming this exists in SyncType enum, if not need strictly mapped
      case SyncType.SYNC_TIME:
        engineSyncType = 'sync_time';
        break;
      case SyncType.FULL:
        engineSyncType = 'full';
        break;
      default:
        engineSyncType = 'full';
    }

    return this.syncEngineService.syncDevice(id, engineSyncType);
  }

  async scanNetwork(subnet?: string): Promise<any[]> {
    // TODO: Define IScanResult
    return this.networkScanner.scanSubnet(subnet);
  }

  async testConnectionByParams(
    ip: string,
    port: number,
  ): Promise<IDeviceResponse> {
    return this.fingerprintService.testConnection(ip, port);
  }
}
