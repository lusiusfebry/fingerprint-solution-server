import { HttpException, HttpStatus } from '@nestjs/common';

export class DeviceConnectionError extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message: `Gagal terhubung ke device: ${message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        details,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
