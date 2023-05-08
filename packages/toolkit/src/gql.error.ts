import { GraphQLError } from 'graphql';

export const GqlBadRequest = (message: string = 'Bad Request') => {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_REQUEST' }
  });
};

export const GqlNotFound = (message: string = 'Not Found') => {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' }
  });
};

export const GqlUnauthorized = (message = 'Unauthorized') => {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' }
  });
};

export const GqlForbidden = (message = 'Forbidden') => {
  return new GraphQLError(message, {
    extensions: { code: 'FORBIDDEN' }
  });
};
