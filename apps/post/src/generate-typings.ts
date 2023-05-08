import { join } from 'path';

import { GraphQLDefinitionsFactory } from '@nestjs/graphql';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./**/*.gql'],
  path: join(process.cwd(), 'src/graphql.schema.ts'),
  outputAs: 'class',
  skipResolverArgs: true,
  emitTypenameField: true,
  watch: true
});
