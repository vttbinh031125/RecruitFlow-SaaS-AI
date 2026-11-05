import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthRequest } from '../decorators/current-user';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token: unknown = request.cookies?.access_token;
    if (typeof token !== 'string') throw new UnauthorizedException();
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        algorithms: ['HS256'],
      });
      if (typeof payload.sub !== 'string') throw new Error('Invalid subject');
      const user = await this.db.user.findUnique({
        where: { id: payload.sub },
        select: { id: true },
      });
      if (!user) throw new Error('Unknown user');
      request.user = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
