import { GqlForbidden, GqlUnauthorized } from '@incognito/toolkit/dist/gql.error';
import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  catch(exception: any, _host: ArgumentsHost) {
    if (exception instanceof GraphQLError) {
      throw exception;
    }

    if (exception.status === 401) {
      throw GqlUnauthorized();
    }

    if (exception.status === 403) {
      throw GqlForbidden();
    }

    if (![404].includes(exception.status)) {
      console.error('*** Unhandled Exception ***\n', exception);
    }
  }
}
