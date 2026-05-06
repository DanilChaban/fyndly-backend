import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((field: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.user) {
    return null;
  }

  if (field) {
    return request.user[field];
  }

  return request.user;
});
