import { HttpException, HttpStatus } from '@nestjs/common';

export class DeviceTimeoutError extends HttpException {
  constructor(message: string) {
    super(
      `Timeout saat berkomunikasi dengan device: ${message}`,
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}
