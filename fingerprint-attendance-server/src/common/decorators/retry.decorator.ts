import { Logger } from '@nestjs/common';

export function Retry(
  maxAttempts: number = 3,
  delayMs: number = 1000,
  backoff: boolean = true,
) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<any>;
    const logger = new Logger('RetryDecorator');

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      let attempts = 0;
      let currentDelay = delayMs;

      while (attempts < maxAttempts) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await originalMethod.apply(this, args);
        } catch (error: any) {
          attempts++;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const errorMessage = (error?.message as string) || '';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const constructorName = (error?.constructor?.name as string) || '';

          // Only retry for potentially transient errors
          const isTransient =
            errorMessage.includes('timeout') ||
            errorMessage.includes('ECONNRESET') ||
            errorMessage.includes('ETIMEDOUT') ||
            constructorName === 'DeviceConnectionError' ||
            constructorName === 'DeviceTimeoutError';

          if (!isTransient || attempts >= maxAttempts) {
            throw error;
          }

          logger.warn(
            `Attempt ${attempts}/${maxAttempts} failed for ${propertyKey}. Retrying in ${currentDelay}ms. Error: ${errorMessage}`,
          );

          await new Promise((resolve) => setTimeout(resolve, currentDelay));

          if (backoff) {
            currentDelay *= 2;
          }
        }
      }
    };

    return descriptor;
  };
}
