import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    // Super admin and main user have all permissions
    if (user?.role === 'super_admin' || user?.role === 'main_user') {
      return true;
    }

    // Check if user has required permissions
    const userPermissions = user?.permissions || [];
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}
