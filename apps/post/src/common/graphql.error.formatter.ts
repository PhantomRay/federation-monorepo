import { GraphQLError, GraphQLFormattedError } from 'graphql';

const { NODE_ENV } = process.env;

export const formatError = (error: GraphQLError) => {
  const msg = error?.message;
  // produce less error
  const graphQLFormattedError: GraphQLFormattedError = {
    message:
      error.extensions.code === 'INTERNAL_SERVER_ERROR' && NODE_ENV === 'production' ? 'Internal server error' : msg,
    extensions: error?.extensions
  };

  if (error.extensions.code === 'INTERNAL_SERVER_ERROR') {
    console.error(error);
  }

  if (NODE_ENV === 'production') {
    delete graphQLFormattedError.extensions?.stacktrace;
    delete graphQLFormattedError.extensions?.originalError;
  }

  return graphQLFormattedError;
};
