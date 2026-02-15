import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  private winstonLogger: winston.Logger;

  constructor(context?: string) {
    super(context || 'App');

    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    );

    this.winstonLogger = winston.createLogger({
      format: logFormat,
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.winstonLogger.info(message as string, { context });
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.winstonLogger.error(message as string, { stack, context });
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.winstonLogger.warn(message as string, { context });
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.winstonLogger.debug(message as string, { context });
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.winstonLogger.verbose(message as string, { context });
  }
}
