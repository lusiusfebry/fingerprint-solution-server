import { Test, TestingModule } from '@nestjs/testing';
import { FingerprintDeviceService } from '../fingerprint-device.service';
import { TcpSocketService } from '../tcp-socket.service';
import { SoapBuilder } from '../../../../common/utils/soap-builder.util';
import { XmlParser } from '../../../../common/utils/xml-parser.util';

jest.mock('../tcp-socket.service');
jest.mock('../../../../common/utils/soap-builder.util');
jest.mock('../../../../common/utils/xml-parser.util');

describe('FingerprintDeviceService', () => {
  let service: FingerprintDeviceService;
  let tcpSocketService: TcpSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FingerprintDeviceService, TcpSocketService],
    }).compile();

    service = module.get<FingerprintDeviceService>(FingerprintDeviceService);
    tcpSocketService = module.get<TcpSocketService>(TcpSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDeviceInfo', () => {
    it('should return device info on success', async () => {
      const config = { ipAddress: '127.0.0.1', port: 80, commKey: '0' };
      const mockResponse = '<xml>response</xml>';
      const mockInfo = { deviceName: 'TestDevice' };

      jest
        .spyOn(SoapBuilder, 'buildGetDeviceInfo')
        .mockReturnValue('<xml>request</xml>');
      jest
        .spyOn(tcpSocketService, 'sendSoapRequest')
        .mockResolvedValue(mockResponse);
      jest.spyOn(XmlParser, 'parseDeviceInfo').mockReturnValue(mockInfo);

      const result = await service.getDeviceInfo(config);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInfo);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tcpSocketService.sendSoapRequest).toHaveBeenCalled();
    });

    it('should return failure on error', async () => {
      const config = { ipAddress: '127.0.0.1', port: 80, commKey: '0' };
      jest
        .spyOn(tcpSocketService, 'sendSoapRequest')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await service.getDeviceInfo(config);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection failed');
    });
  });
});
