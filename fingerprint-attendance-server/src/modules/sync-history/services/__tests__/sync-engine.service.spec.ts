import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SyncEngineService } from '../sync-engine.service';
import { Device } from '../../../../database/entities/device.entity';
import { Employee } from '../../../../database/entities/employee.entity';
import { FingerprintDeviceService } from '../../../devices/services/fingerprint-device.service';
import { AttendanceLogsService } from '../../../attendance-logs/attendance-logs.service';
import { EmployeesService } from '../../../employees/employees.service';
import { DevicesGateway } from '../../../devices/devices.gateway';
import { SyncHistoryService } from '../../sync-history.service';
import { SyncQueueService } from '../sync-queue.service';

describe('SyncEngineService', () => {
  let service: SyncEngineService;

  const mockDeviceRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockEmployeeRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDeviceCommService = {
    getLogs: jest.fn(),
    downloadAttendanceLogs: jest.fn(),
    uploadEmployee: jest.fn(),
    uploadFingerprintTemplate: jest.fn(),
    setTime: jest.fn(),
  };

  const mockAttendanceLogsService = {
    saveLogs: jest.fn(),
  };

  const mockEmployeesService = {
    findAll: jest.fn(),
  };

  const mockDevicesGateway = {
    server: {
      emit: jest.fn(),
    },
  };

  const mockSyncHistoryService = {
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSyncQueueService = {
    addJob: jest.fn(),
    getJob: jest.fn(),
    updateJob: jest.fn(),
    getJobsByDevice: jest.fn().mockReturnValue([]),
    markJobProcessing: jest.fn(),
    markJobCompleted: jest.fn(),
    markJobFailed: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncEngineService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepo,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: FingerprintDeviceService,
          useValue: mockDeviceCommService,
        },
        {
          provide: AttendanceLogsService,
          useValue: mockAttendanceLogsService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: DevicesGateway,
          useValue: mockDevicesGateway,
        },
        {
          provide: SyncHistoryService,
          useValue: mockSyncHistoryService,
        },
        {
          provide: SyncQueueService,
          useValue: mockSyncQueueService,
        },
      ],
    }).compile();

    service = module.get<SyncEngineService>(SyncEngineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncDevice', () => {
    it('should add a job to the queue and return jobId', async () => {
      const deviceId = 'uuid-1';
      mockDeviceRepo.findOne.mockResolvedValue({
        id: deviceId,
        status: 'online',
      });
      mockSyncQueueService.addJob.mockReturnValue('job-1');

      const result = await service.syncDevice(deviceId, 'pull_logs');

      expect(result).toEqual({ jobId: 'job-1', status: 'queued' });
      expect(mockSyncQueueService.addJob).toHaveBeenCalled();
    });
  });

  describe('pullLogsFromDevice', () => {
    const device = {
      id: 'uuid-1',
      ip_address: '192.168.1.1',
      port: 4370,
      comm_key: '0',
    } as Device;

    it('should pull logs and save them', async () => {
      const mockLogs = {
        success: true,
        data: [{ pin: '1', timestamp: '2024-01-01' }],
      };
      mockDeviceCommService.downloadAttendanceLogs.mockResolvedValue(mockLogs);
      mockAttendanceLogsService.saveLogs.mockResolvedValue({ count: 1 });

      const result = await service.pullLogsFromDevice(device);

      expect(result.count).toBe(1);
      expect(mockDeviceCommService.downloadAttendanceLogs).toHaveBeenCalled();
      expect(mockAttendanceLogsService.saveLogs).toHaveBeenCalled();
    });
  });

  describe('pushEmployeesToDevice', () => {
    const device = { id: 'uuid-1' } as Device;

    it('should push active employees to device', async () => {
      const employees = [
        { nik: 'EMP1', nama: 'Budi', status: 'aktif' },
      ] as Employee[];
      mockEmployeesService.findAll.mockResolvedValue(employees);
      mockDeviceCommService.uploadEmployee.mockResolvedValue({ success: true });

      const result = await service.pushEmployeesToDevice(device);

      expect(result.success).toBe(1);
      expect(mockDeviceCommService.uploadEmployee).toHaveBeenCalled();
    });
  });

  describe('retryFailedSync', () => {
    it('should retry a failed sync by creating a new job', async () => {
      const syncHistory = {
        id: 'hist-1',
        device_id: 'dev-1',
        sync_type: 'pull_logs',
      };
      mockSyncHistoryService.findOne.mockResolvedValue(syncHistory);
      mockDeviceRepo.findOne.mockResolvedValue({
        id: 'dev-1',
        status: 'online',
      });
      mockSyncQueueService.addJob.mockReturnValue('job-new');

      const result = await service.retryFailedSync('hist-1');

      expect(result.jobId).toBe('job-new');
      expect(mockSyncQueueService.addJob).toHaveBeenCalledWith(
        'dev-1',
        'pull_logs',
        0,
        undefined,
      );
    });
  });
});
