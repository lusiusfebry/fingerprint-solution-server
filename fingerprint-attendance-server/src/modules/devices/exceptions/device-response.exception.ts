import { HttpException, HttpStatus } from '@nestjs/common';

export class DeviceResponseError extends HttpException {
  constructor(message: string) {
    super(
      `Response tidak valid dari device: ${message}`,
      HttpStatus.BAD_GATEWAY,
    );
  }
}
