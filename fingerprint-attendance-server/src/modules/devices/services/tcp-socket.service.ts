import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import { IConnectionConfig } from '../interfaces/connection-config.interface';
import { DeviceConnectionError } from '../exceptions/device-connection.exception';
import { DeviceTimeoutError } from '../exceptions/device-timeout.exception';

@Injectable()
export class TcpSocketService {
  private readonly logger = new Logger(TcpSocketService.name);
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly CONNECTION_TIMEOUT = 5000;

  async sendSoapRequest(
    config: IConnectionConfig,
    soapXml: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      const timeout = config.timeout || this.DEFAULT_TIMEOUT;
      let responseData = '';
      let isConnected = false;

      // Set timeout
      client.setTimeout(timeout);

      client.on('connect', () => {
        isConnected = true;
        this.logger.debug(`Connected to ${config.ipAddress}:${config.port}`);

        const request =
          `POST /iWsService HTTP/1.0\r\n` +
          `Content-Type: text/xml\r\n` +
          `Content-Length: ${Buffer.byteLength(soapXml, 'utf8')}\r\n` +
          `\r\n` +
          soapXml;

        client.write(request);
      });

      client.on('data', (data) => {
        responseData += data.toString();
      });

      client.on('end', () => {
        this.logger.debug(`Connection closed by ${config.ipAddress}`);
        if (!responseData) {
          // Sometimes 'end' comes without data if connection drops immediately or protocol error
          // check if we got any data
        }
        resolve(responseData);
      });

      client.on('error', (err) => {
        this.logger.error(`Socket error: ${err.message}`);
        client.destroy();
        reject(new DeviceConnectionError(err.message));
      });

      client.on('timeout', () => {
        this.logger.error(`Socket timeout after ${timeout}ms`);
        client.destroy();
        reject(new DeviceTimeoutError(`No response within ${timeout}ms`));
      });

      // Attempt connection
      try {
        client.connect(config.port, config.ipAddress);

        // Additional connection timeout logic because socket.connect doesn't adhere strictly to setTimeout for the initial handshake in some node versions/platforms same way
        setTimeout(() => {
          if (!isConnected) {
            client.destroy();
            reject(new DeviceConnectionError('Connection timed out'));
          }
        }, this.CONNECTION_TIMEOUT);
      } catch (err) {
        reject(new DeviceConnectionError((err as Error).message));
      }
    });
  }

  async testConnection(
    ipAddress: string,
    port: number,
    timeout: number = 5000,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      client.setTimeout(timeout);

      client.on('connect', () => {
        client.destroy();
        resolve(true);
      });

      client.on('error', () => {
        client.destroy();
        resolve(false);
      });

      client.on('timeout', () => {
        client.destroy();
        resolve(false);
      });

      client.connect(port, ipAddress);
    });
  }
}
