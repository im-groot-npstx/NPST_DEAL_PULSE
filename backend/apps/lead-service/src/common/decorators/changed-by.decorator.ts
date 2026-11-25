import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CHANGED_BY_HEADER } from '../constants/lead-lifecycle.constants';

/**
 * Reads the acting user id from the shared auth gateway convention header.
 * Integration point: replace with JWT claims when libs/security is wired.
 */
export const ChangedBy = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const raw =
      request.headers[CHANGED_BY_HEADER] ??
      request.headers[CHANGED_BY_HEADER.toUpperCase()];
    return raw?.trim() || undefined;
  },
);