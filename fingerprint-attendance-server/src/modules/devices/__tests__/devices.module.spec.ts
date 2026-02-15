import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from '../devices.service';
import { DevicesController } from '../devices.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Device } from '../../../database/entities/device.entity';
import { FingerprintDeviceService } from '../services/fingerprint-device.service';
import { DevicesGateway } from '../devices.gateway';
import { NetworkScannerService } from '../services/network-scanner.service';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from '../dto/create-device.dto';

import { AttendanceLogsService } from '../../attendance-logs/attendance-logs.service';
import { EmployeesService } from '../../employees/employees.service';

describe('DevicesModule Integration', () => {
  let service: DevicesService;
  let controller: DevicesController;
  let repository: Repository<Device>;
  // let gateway: DevicesGateway;

  const mockDeviceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockFingerprintService = {
    testConnection: jest
      .fn()
      .mockResolvedValue({ success: true, message: 'Connected' }),
    getDeviceInfo: jest
      .fn()
      .mockResolvedValue({ success: true, data: { serialNumber: 'SN123' } }),
    uploadEmployee: jest
      .fn()
      .mockResolvedValue({ success: true, message: 'Uploaded' }),
  };

  const mockDevicesGateway = {
    emitDeviceAdded: jest.fn(),
    emitDeviceUpdated: jest.fn(),
    emitDeviceDeleted: jest.fn(),
    emitDeviceStatusUpdate: jest.fn(),
    emitSyncProgress: jest.fn(),
  };

  const mockNetworkScanner = {
    scanSubnet: jest.fn().mockResolvedValue([]),
  };

  const mockAttendanceLogsService = {
    saveLogs: jest.fn().mockResolvedValue(undefined),
  };

  const mockEmployeesService = {
    getEmployeesForDevice: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepository,
        },
        {
          provide: FingerprintDeviceService,
          useValue: mockFingerprintService,
        },
        {
          provide: DevicesGateway,
          useValue: mockDevicesGateway,
        },
        {
          provide: NetworkScannerService,
          useValue: mockNetworkScanner,
        },
        {
          provide: AttendanceLogsService,
          useValue: mockAttendanceLogsService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    controller = module.get<DevicesController>(DevicesController);
    repository = module.get<Repository<Device>>(getRepositoryToken(Device));
    // gateway = module.get<DevicesGateway>(DevicesGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new device', async () => {
      const createDto: CreateDeviceDto = {
        name: 'Test Device',
        ip_address: '192.168.1.200',
        port: 80,
        serial_number: 'SN123456',
      };

      const savedDevice = {
        id: '1',
        ...createDto,
        status: 'online',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDeviceRepository.findOne.mockResolvedValue(null); // No duplicate
      mockDeviceRepository.create.mockReturnValue(savedDevice);
      mockDeviceRepository.save.mockResolvedValue(savedDevice);

      const result = await controller.create(createDto);

      expect(result).toEqual(savedDevice);
      expect(mockFingerprintService.testConnection).toHaveBeenCalledWith(
        createDto.ip_address,
        createDto.port,
      );
      expect(mockDevicesGateway.emitDeviceAdded).toHaveBeenCalledWith(
        savedDevice,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of devices', async () => {
      const devices = [{ id: '1', name: 'Device 1' }];
      mockDeviceRepository.find.mockResolvedValue(devices);

      const result = await controller.findAll();

      expect(repository).toBeDefined(); // Ensure repository is used
      expect(result).toEqual(devices);
    });
  });
});
