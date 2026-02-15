/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { TcpSocketService } from '../tcp-socket.service';
import * as net from 'net';
import { EventEmitter } from 'events';
import { DeviceConnectionError } from '../../exceptions/device-connection.exception';

jest.mock('net');

describe('TcpSocketService', () => {
  let service: TcpSocketService;

  let mockSocket: any;

  beforeEach(async () => {
    mockSocket = new EventEmitter();
    mockSocket.connect = jest.fn();
    mockSocket.write = jest.fn();
    mockSocket.destroy = jest.fn();
    mockSocket.setTimeout = jest.fn();

    (net.Socket as unknown as jest.Mock).mockImplementation(() => mockSocket);

    const module: TestingModule = await Test.createTestingModule({
      providers: [TcpSocketService],
    }).compile();

    service = module.get<TcpSocketService>(TcpSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSoapRequest', () => {
    it('should resolve with response data on success', async () => {
      const promise = service.sendSoapRequest(
        { ipAddress: '127.0.0.1', port: 80, commKey: '0' },
        '<xml>test</xml>',
      );

      mockSocket.emit('connect');
      mockSocket.emit('data', Buffer.from('response data'));
      mockSocket.emit('end');

      await expect(promise).resolves.toBe('response data');
      /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
      expect(mockSocket.connect).toHaveBeenCalledWith(80, '127.0.0.1');
    });

    it('should reject with DeviceConnectionError on error', async () => {
      const promise = service.sendSoapRequest(
        { ipAddress: '127.0.0.1', port: 80, commKey: '0' },
        '<xml>test</xml>',
      );

      mockSocket.emit('error', new Error('Connection refused'));

      await expect(promise).rejects.toThrow(DeviceConnectionError);
    });
  });
});
