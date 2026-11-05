import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
export type AuthRequest = Request & { user: { id: string } };
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    context.switchToHttp().getRequest<AuthRequest>().user.id,
);
