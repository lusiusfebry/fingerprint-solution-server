import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Device } from '../../../database/entities/device.entity';
import { Employee } from '../../../database/entities/employee.entity';
import { FingerprintTemplate } from '../../../database/entities/fingerprint-template.entity';

import { FingerprintDeviceService } from '../../devices/services/fingerprint-device.service';
import { AttendanceLogsService } from '../../attendance-logs/attendance-logs.service';
import { EmployeesService } from '../../employees/employees.service';
import { DevicesGateway } from '../../devices/devices.gateway';

import { SyncHistoryService } from '../sync-history.service';
import { SyncQueueService } from './sync-queue.service';
import { Retry } from '../../../common/decorators/retry.decorator';
import { IAttendanceLog } from '../../devices/interfaces/device-response.interface';
import { IAttendanceLogWithDevice } from '../../attendance-logs/attendance-logs.service';

@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly configService: ConfigService,
    private readonly fingerprintDeviceService: FingerprintDeviceService,
    private readonly attendanceLogsService: AttendanceLogsService,
    @Inject(forwardRef(() => EmployeesService))
    private readonly employeesService: EmployeesService,
    private readonly devicesGateway: DevicesGateway,
    private readonly syncHistoryService: SyncHistoryService,
    private readonly syncQueueService: SyncQueueService,
  ) {}

  async syncDevice(
    deviceId: string,
    syncType:
      | 'pull_logs'
      | 'push_employees'
      | 'push_templates'
      | 'sync_time'
      | 'full',
    conflictMode?: 'server_override' | 'device_override',
  ): Promise<{ jobId: string; status: string }> {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    if (device.status !== 'online') {
      // throw new Error(`Device ${device.name} is offline`);
      // Better to log warning and queue, or fail if immediate required.
      // For now, let's proceed but catch error in processJob if connect fails
    }

    // Prevent concurrent sync for same device
    if (
      this.syncQueueService
        .getJobsByDevice(deviceId)
        .some((j) => j.status === 'processing')
    ) {
      this.logger.warn(
        `Device ${device.name} is already syncing. Queuing job.`,
      );
    }

    const jobId = this.syncQueueService.addJob(
      deviceId,
      syncType,
      0,
      conflictMode,
    );

    this.processJob(jobId).catch((err) => {
      this.logger.error(
        `Error processing sync job ${jobId}: ${(err as Error).message}`,
      );
    });

    return { jobId, status: 'queued' };
  }

  async processJob(jobId: string) {
    this.syncQueueService.markJobProcessing(jobId);
    const job = this.syncQueueService['jobs'].get(jobId);

    if (!job) return;

    const device = await this.deviceRepository.findOne({
      where: { id: job.deviceId },
    });
    if (!device) {
      this.syncQueueService.markJobFailed(jobId, 'Device not found');
      return;
    }

    try {
      // Update device status
      await this.deviceRepository.update(device.id, { status: 'syncing' });
      this.devicesGateway.emitDeviceStatusUpdate(device.id, 'syncing', true);

      this.devicesGateway.emitSyncStarted(device.id, job.syncType, new Date());

      let result: any;
      let recordsCount = 0;

      switch (job.syncType) {
        case 'pull_logs':
          result = await this.pullLogsFromDevice(device);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          recordsCount = result.count;
          break;
        case 'push_employees':
          result = await this.pushEmployeesToDevice(device, job.conflictMode);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          recordsCount = result.success;
          break;
        case 'push_templates':
          result = await this.pushTemplatesToDevice(device, job.conflictMode);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          recordsCount = result.success;
          break;
        case 'sync_time':
          result = await this.syncTimeToDevice(device);
          break;
        case 'full':
          result = await this.fullSync(device, job.conflictMode);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          recordsCount = result.totalRecords;
          break;
      }

      this.syncQueueService.markJobCompleted(jobId);
      await this.syncHistoryService.create(
        device.id,
        job.syncType,
        'success',
        recordsCount,
      );

      await this.deviceRepository.update(device.id, {
        status: 'online',
        last_sync_time: new Date(),
      });

      this.devicesGateway.emitDeviceStatusUpdate(device.id, 'online', true);
      this.devicesGateway.emitSyncCompleted(
        device.id,
        job.syncType,
        recordsCount,
        new Date(),
      );
    } catch (error) {
      this.logger.error(
        `Sync failed for device ${device.name}: ${(error as Error).message}`,
      );
      this.syncQueueService.markJobFailed(jobId, (error as Error).message);
      await this.syncHistoryService.create(
        device.id,
        job.syncType,
        'failed',
        0,
        (error as Error).message,
      );

      await this.deviceRepository.update(device.id, { status: 'error' }); // or keep online if just sync failed? usually sync error -> check device
      this.devicesGateway.emitDeviceStatusUpdate(device.id, 'error', false); // actually maybe not offline, but error state

      this.devicesGateway.emitSyncFailed(
        device.id,
        job.syncType,
        (error as Error).message,
        new Date(),
      );
    }
  }

  @Retry(3, 1000)
  async pullLogsFromDevice(device: Device): Promise<{ count: number }> {
    const config = this.getDeviceConfig(device);
    const response =
      await this.fingerprintDeviceService.downloadAttendanceLogs(config);

    if (!response.success) {
      throw new Error(response.message);
    }

    const logs = response.data as IAttendanceLog[];

    // Add device_id to logs
    const logsWithDevice: IAttendanceLogWithDevice[] = logs.map((log) => ({
      ...log,
      device_id: device.id,
      timestamp: new Date(log.dateTime || ''), // Ensure date object
    }));

    await this.attendanceLogsService.saveLogs(logsWithDevice);
    this.logger.log(
      `Pulled ${logsWithDevice.length} logs from device ${device.name}`,
    );
    return { count: logsWithDevice.length };
  }

  async pushEmployeesToDevice(
    device: Device,
    conflictMode: string = 'server_override',
  ): Promise<{ success: number; failed: number }> {
    const config = this.getDeviceConfig(device);

    let devicePins: string[] = [];
    if (conflictMode === 'device_override') {
      const response =
        await this.fingerprintDeviceService.downloadEmployees(config);
      if (response.success && Array.isArray(response.data)) {
        devicePins = (response.data as { pin: string }[]).map((u) => u.pin);
      }
    }

    const employees = await this.employeesService.findAll();

    // Filter only active employees
    const activeEmployees = employees.filter((e) => e.status === 'aktif');

    let success = 0;
    let failed = 0;

    for (const [index, employee] of activeEmployees.entries()) {
      try {
        if (
          conflictMode === 'device_override' &&
          devicePins.includes(employee.nik)
        ) {
          this.logger.debug(
            `Skipping employee ${employee.nik} - already on device (device_override)`,
          );
          continue;
        }

        await this.fingerprintDeviceService.uploadEmployee(
          config,
          employee.nik,
          employee.nama,
        );
        success++;

        // Emit progress every 10%
        if (
          activeEmployees.length > 10 &&
          index % Math.ceil(activeEmployees.length / 10) === 0
        ) {
          this.devicesGateway.emitSyncProgress(
            device.id,
            Math.round(((index + 1) / activeEmployees.length) * 100),
            `Pushing employees (${index + 1}/${activeEmployees.length})`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to push employee ${employee.nik} to ${device.name}: ${(error as Error).message}`,
        );
        failed++;
      }
    }

    return { success, failed };
  }

  async pushTemplatesToDevice(
    device: Device,
    conflictMode: string = 'server_override',
  ): Promise<{ success: number; failed: number }> {
    const config = this.getDeviceConfig(device);

    let deviceTemplates: any[] = [];
    if (conflictMode === 'device_override') {
      const response =
        await this.fingerprintDeviceService.downloadTemplates(config);
      if (response.success && Array.isArray(response.data)) {
        deviceTemplates = response.data;
      }
    }

    const employees = await this.employeesService.findAll();

    let success = 0;
    let failed = 0;

    // Flatten templates
    const templatesToSync: { nik: string; template: FingerprintTemplate }[] =
      [];
    for (const emp of employees) {
      if (
        emp.status === 'aktif' &&
        emp.fingerprint_templates &&
        emp.fingerprint_templates.length > 0
      ) {
        for (const tmpl of emp.fingerprint_templates) {
          templatesToSync.push({ nik: emp.nik, template: tmpl });
        }
      }
    }

    for (const [index, item] of templatesToSync.entries()) {
      try {
        if (conflictMode === 'device_override') {
          const exists = (
            deviceTemplates as { pin: string; fingerId: number }[]
          ).some(
            (dt) =>
              dt.pin === item.nik && dt.fingerId === item.template.finger_index,
          );
          if (exists) {
            this.logger.debug(
              `Skipping template for ${item.nik} index ${item.template.finger_index} (device_override)`,
            );
            continue;
          }
        }

        await this.fingerprintDeviceService.uploadFingerprintTemplate(
          config,
          item.nik,
          item.template.finger_index,
          item.template.template_data,
        );
        success++;
        // Emit progress every 10%
        if (
          templatesToSync.length > 10 &&
          index % Math.ceil(templatesToSync.length / 10) === 0
        ) {
          this.devicesGateway.emitSyncProgress(
            device.id,
            Math.round(((index + 1) / templatesToSync.length) * 100),
            `Pushing templates (${index + 1}/${templatesToSync.length})`,
          );
        }
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  async syncTimeToDevice(device: Device): Promise<{ success: boolean }> {
    const config = this.getDeviceConfig(device);
    const response = await this.fingerprintDeviceService.syncTime(config);
    return { success: response.success };
  }

  async fullSync(device: Device, conflictMode?: string) {
    const logs = await this.pullLogsFromDevice(device);
    const emp = await this.pushEmployeesToDevice(device, conflictMode);
    const tmpl = await this.pushTemplatesToDevice(device, conflictMode);
    const timeSync = await this.syncTimeToDevice(device);

    return {
      totalRecords: logs.count + emp.success + tmpl.success,
      details: {
        logs: logs.count,
        employees: emp,
        templates: tmpl,
        timeSync,
      },
    };
  }

  async syncMultipleDevices(
    deviceIds: string[],
    syncType:
      | 'pull_logs'
      | 'push_employees'
      | 'push_templates'
      | 'sync_time'
      | 'full',
  ): Promise<any[]> {
    // TODO: Define strict SyncType if possible
    const results: any[] = [];
    for (const id of deviceIds) {
      try {
        const res = await this.syncDevice(id, syncType);
        results.push({ id, ...res });
      } catch (error) {
        results.push({ id, status: 'failed', error: (error as Error).message });
      }
    }
    return results;
  }

  async syncAllDevices(
    syncType:
      | 'pull_logs'
      | 'push_employees'
      | 'push_templates'
      | 'sync_time'
      | 'full',
  ) {
    const devices = await this.deviceRepository.find({
      where: { status: 'online' },
    });
    return this.syncMultipleDevices(
      devices.map((d) => d.id),
      syncType,
    );
  }

  async retryFailedSync(syncHistoryId: string) {
    const history = await this.syncHistoryService.findOne(syncHistoryId);
    if (!history || history.status === 'success') {
      throw new Error('Sync record not found or already success');
    }

    return this.syncDevice(
      history.device_id,
      history.sync_type as
        | 'pull_logs'
        | 'push_employees'
        | 'push_templates'
        | 'sync_time'
        | 'full',
    );
  }

  private getDeviceConfig(device: Device) {
    return {
      ipAddress: device.ip_address,
      port: device.port,
      commKey: device.comm_key || '0',
      timeout: 5000,
    };
  }
}
