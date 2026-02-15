import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      'permission',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    const [resource, action] = requiredPermission.split(':');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const userPermissions = user?.role?.permissions;

    if (!userPermissions) return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (userPermissions[resource] && Array.isArray(userPermissions[resource])) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return userPermissions[resource].includes(action);
    }

    return false;
  }
}
