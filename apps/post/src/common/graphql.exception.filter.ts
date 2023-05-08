import { ArgumentsHost, BadRequestException, Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch(BadRequestException)
export class GqlBadRequestExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, _host: ArgumentsHost) {
    const response = exception.getResponse();
    const { message } = response as any;
    const errors = Array.isArray(message) ? message.map((m) => ({ message: m })) : [{ message }];

    return { status: 'BAD_REQUEST', errors };
  }
}
