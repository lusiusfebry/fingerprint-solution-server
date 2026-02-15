/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceLogsService } from '../attendance-logs.service';
import { AttendanceLog } from '../../../database/entities/attendance-log.entity';
import { Employee } from '../../../database/entities/employee.entity';
import { Device } from '../../../database/entities/device.entity';
import { DevicesGateway } from '../../devices/devices.gateway';

describe('AttendanceLogsService', () => {
  let service: AttendanceLogsService;

  const mockLogRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn().mockResolvedValue({ identifiers: [] }),
  };

  const mockEmployeeRepo = {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockDeviceRepo = {
    findOne: jest.fn(),
  };

  const mockDevicesGateway = {
    emitAttendanceLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceLogsService,
        {
          provide: getRepositoryToken(AttendanceLog),
          useValue: mockLogRepo,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepo,
        },
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepo,
        },
        {
          provide: DevicesGateway,
          useValue: mockDevicesGateway,
        },
      ],
    }).compile();

    service = module.get<AttendanceLogsService>(AttendanceLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveLogs', () => {
    const rawLogs = [
      {
        pin: 'EMP1',
        timestamp: new Date(),
        time: new Date().toISOString(),
        device_id: 'dev-1',
        verified: '1',
        status: '0',
      },
    ];

    it('should validate and save logs if employee and device exist', async () => {
      const employee = {
        id: 'emp-uuid',
        nik: 'EMP1',
      };
      mockEmployeeRepo.findOne.mockResolvedValue(employee);
      mockEmployeeRepo.find.mockResolvedValue([employee]);
      mockDeviceRepo.findOne.mockResolvedValue({ id: 'dev-uuid' });
      mockLogRepo.findOne.mockResolvedValue(null); // No duplicate
      mockLogRepo.create.mockImplementation((dto) => dto as any);
      mockLogRepo.save.mockResolvedValue({});

      await service.saveLogs(rawLogs as any);

      expect(mockLogRepo.upsert).toHaveBeenCalled();
      expect(mockDevicesGateway.emitAttendanceLog).toHaveBeenCalled();
    });

    it('should ignore log if employee not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await service.saveLogs(rawLogs as any);

      expect(mockLogRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('validateLog', () => {
    it('should return valid true if employee and device exist', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ id: 'emp-1' });
      mockDeviceRepo.findOne.mockResolvedValue({ id: 'dev-1' });

      const result = await service.validateLog({
        pin: 'EMP1',
        device_id: 'dev-1',
        verified: '1',
        status: '0',
        time: new Date().toISOString(),
      } as any);

      expect(result.valid).toBe(true);
    });

    it('should return errors if employee not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      mockDeviceRepo.findOne.mockResolvedValue({ id: 'dev-1' });

      const result = await service.validateLog({
        pin: 'EMP1',
        device_id: 'dev-1',
        verified: '1',
        status: '0',
        time: new Date().toISOString(),
      } as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Karyawan dengan NIK EMP1 tidak ditemukan',
      );
    });
  });

  describe('calculateAttendance', () => {
    it('should return calculated results for a given filter', async () => {
      // Simplistic check as calculateAttendance involves many queries
      mockLogRepo.find.mockResolvedValue([]);
      mockEmployeeRepo.findOne.mockResolvedValue({
        id: 'emp-1',
        employee_shifts: [],
      });

      const result = await service.calculateAttendance({
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeDefined();
    });
  });
});
