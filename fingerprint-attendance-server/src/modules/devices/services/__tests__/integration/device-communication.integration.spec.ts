import { Test, TestingModule } from '@nestjs/testing';
import { FingerprintDeviceService } from '../../fingerprint-device.service';
import { TcpSocketService } from '../../tcp-socket.service';
import * as net from 'net';
import { IConnectionConfig } from '../../../interfaces/connection-config.interface';

describe('Device Communication Integration', () => {
  let service: FingerprintDeviceService;
  let server: net.Server;
  const PORT = 3001;
  const HOST = '127.0.0.1';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FingerprintDeviceService, TcpSocketService],
    }).compile();

    service = module.get<FingerprintDeviceService>(FingerprintDeviceService);

    // Start mock device server
    server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const request = data.toString();

        if (request.includes('GetAttLog')) {
          const response = `
            <GetAttLogResponse>
              <Row>
                <PIN>123</PIN>
                <DateTime>2023-01-01 08:00:00</DateTime>
                <Verified>1</Verified>
                <Status>0</Status>
              </Row>
            </GetAttLogResponse>
          `;
          socket.write(response);
          socket.end();
        } else if (request.includes('GetDeviceInfo')) {
          const response = `
            <GetDeviceInfoResponse>
                <SerialNumber>SNMOCK123</SerialNumber>
                <DeviceName>MockDevice</DeviceName>
            </GetDeviceInfoResponse>
          `;
          socket.write(response);
          socket.end();
        } else {
          socket.write('<Response>Unknown Command</Response>');
          socket.end();
        }
      });
    });

    await new Promise<void>((resolve) => server.listen(PORT, HOST, resolve));
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should connect and download attendance logs', async () => {
    const config: IConnectionConfig = {
      ipAddress: HOST,
      port: PORT,
      commKey: '0',
      timeout: 1000,
    };

    const result = await service.downloadAttendanceLogs(config);

    expect(result.success).toBe(true);
    const data = result.data as any[];
    expect(data).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(data[0].pin).toBe('123');
  });

  it('should connect and get device info', async () => {
    const config: IConnectionConfig = {
      ipAddress: HOST,
      port: PORT,
      commKey: '0',
      timeout: 1000,
    };

    const result = await service.getDeviceInfo(config);

    expect(result.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = result.data;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(data.deviceName).toBe('MockDevice');
  });
});
