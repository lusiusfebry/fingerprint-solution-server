import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = (request as any).user as User;
    const ip = request.ip || request.connection?.remoteAddress || '';
    const userAgent = (request.headers['user-agent'] as string) || '';

    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response) => {
        if (user && user.id) {
          const action = this.mapMethodToAction(method);
          const resource = this.extractResource(url);

          let resourceId: string | null = null;
          // Try to extract resource ID from response or params
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (response && response.id) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            resourceId = response.id;
          } else if (request.params && request.params.id) {
            resourceId = request.params.id as string;
          }

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.auditLogsService.createLog({
            user_id: user.id,
            action,
            resource,
            resource_id: resourceId ?? undefined,
            ip_address: ip,
            user_agent: userAgent,
            details: { url, method },
          });
        }
      }),
    );
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
        return 'UPDATE';
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }

  private extractResource(url: string): string {
    // extract 'users' from '/api/users/123'
    const parts = url.split('/');
    if (parts.length > 2 && parts[1] === 'api') {
      return parts[2];
    }
    return 'unknown';
  }
}
