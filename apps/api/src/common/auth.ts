import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from '@ridean/shared';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export const IS_PUBLIC = 'isPublic';
export const ROLES = 'roles';
/** Route needs no login. */
export const Public = () => SetMetadata(IS_PUBLIC, true);
/** Route needs one of these roles (admin always passes). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles);

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser | undefined => {
  return ctx.switchToHttp().getRequest().user;
});

/** Global guard: verifies the Bearer JWT unless the route is @Public(), then enforces @Roles(). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    const header: string | undefined = req.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: UserRole }>(token);
        req.user = { id: payload.sub, email: payload.email, role: payload.role } satisfies AuthUser;
      } catch {
        if (!isPublic) throw new UnauthorizedException('Your session has expired. Please sign in again.');
      }
    }
    if (isPublic) return true;
    if (!req.user) throw new UnauthorizedException('Please sign in');

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length && req.user.role !== 'admin' && !roles.includes(req.user.role)) {
      throw new ForbiddenException('You do not have access to this area');
    }
    return true;
  }
}
