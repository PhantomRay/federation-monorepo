import { JwtUserInfo } from '@incognito/toolkit/dist/auth/user.strategy';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator<unknown, ExecutionContext, JwtUserInfo>((_, context) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
