/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { EmployeesService } from '../employees.service';
import { Employee } from '../../../database/entities/employee.entity';
import { Device } from '../../../database/entities/device.entity';
import { FingerprintTemplatesService } from '../../fingerprint-templates/fingerprint-templates.service';
import { FingerprintDeviceService } from '../../devices/services/fingerprint-device.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const mockEmployeeRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockDeviceRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockTemplatesService = {
    create: jest.fn(),
    deleteByEmployee: jest.fn(),
  };

  const mockDeviceCommService = {
    uploadEmployee: jest.fn(),
    deleteEmployee: jest.fn(),
    uploadFingerprintTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepo,
        },
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepo,
        },
        {
          provide: FingerprintTemplatesService,
          useValue: mockTemplatesService,
        },
        {
          provide: FingerprintDeviceService,
          useValue: mockDeviceCommService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateEmployeeDto = {
      nik: 'EMP001',
      nama: 'Budi Test',
      status: 'aktif',
    };

    it('should create a new employee and push to devices if active', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      mockEmployeeRepo.create.mockReturnValue(createDto);
      mockEmployeeRepo.save.mockResolvedValue({ ...createDto, id: 'uuid-1' });
      mockDeviceRepo.find.mockResolvedValue([
        {
          name: 'Device 1',
          ip_address: '192.168.1.1',
          port: 4370,
          status: 'online',
        },
      ]);

      const result = await service.create(createDto);

      expect(result).toEqual({ ...createDto, id: 'uuid-1' });
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
      expect(mockDeviceCommService.uploadEmployee).toHaveBeenCalled();
    });

    it('should throw BadRequestException if NIK already exists', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const employee = {
      id: 'uuid-1',
      nik: 'EMP001',
      nama: 'Budi',
      status: 'aktif',
    };
    const updateDto: UpdateEmployeeDto = { nama: 'Budi Updated' };

    it('should update employee and push to devices', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(employee);
      mockEmployeeRepo.save.mockResolvedValue({ ...employee, ...updateDto });
      mockDeviceRepo.find.mockResolvedValue([
        {
          name: 'Device 1',
          ip_address: '192.168.1.1',
          port: 4370,
          status: 'online',
        },
      ]);

      const result = await service.update('uuid-1', updateDto);

      expect(result.nama).toBe('Budi Updated');
      expect(mockDeviceCommService.uploadEmployee).toHaveBeenCalled();
    });

    it('should delete from devices if status changed to nonaktif', async () => {
      const nonActiveDto: UpdateEmployeeDto = { status: 'nonaktif' };
      mockEmployeeRepo.findOne.mockResolvedValue(employee);
      mockEmployeeRepo.save.mockResolvedValue({
        ...employee,
        status: 'nonaktif',
      });
      mockDeviceRepo.find.mockResolvedValue([
        {
          name: 'Device 1',
          ip_address: '192.168.1.1',
          port: 4370,
          status: 'online',
        },
      ]);

      await service.update('uuid-1', nonActiveDto);

      expect(mockDeviceCommService.deleteEmployee).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete from devices and remove from repo', async () => {
      const employee = { id: 'uuid-1', nik: 'EMP001', status: 'aktif' };
      mockEmployeeRepo.findOne.mockResolvedValue(employee);
      mockDeviceRepo.find.mockResolvedValue([{ status: 'online' }]);

      await service.remove('uuid-1');

      expect(mockDeviceCommService.deleteEmployee).toHaveBeenCalled();
      expect(mockEmployeeRepo.remove).toHaveBeenCalled();
    });
  });

  describe('uploadFingerprint', () => {
    it('should save template and push to devices', async () => {
      const employee = { id: 'uuid-1', nik: 'EMP001', status: 'aktif' };
      const uploadDto = { finger_index: 0, template_data: 'base64-data' };

      mockEmployeeRepo.findOne.mockResolvedValue(employee);
      mockTemplatesService.create.mockResolvedValue({ id: 'temp-1' });
      mockDeviceRepo.find.mockResolvedValue([{ status: 'online' }]);

      const result = await service.uploadFingerprint('uuid-1', uploadDto);

      expect(result.success).toBe(true);
      expect(mockTemplatesService.create).toHaveBeenCalledWith(
        'uuid-1',
        0,
        'base64-data',
      );
      expect(
        mockDeviceCommService.uploadFingerprintTemplate,
      ).toHaveBeenCalled();
    });
  });
});
