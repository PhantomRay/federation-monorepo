// https://github.com/devoxa/prisma-relay-cursor-connection

import graphqlFields from 'graphql-fields';

import { Connection, ConnectionArguments, Edge, Options, PrismaFindManyArguments } from './relay.interfaces';
import { GqlBadRequest } from '../gql.error';

export * from './relay.interfaces';

const MAX_LIMIT = 500;

export async function findManyCursorConnection<
  Record = { id: string },
  Cursor = { id: string },
  Node = Record,
  CustomEdge extends Edge<Node> = Edge<Node>
>(
  findMany: (args: PrismaFindManyArguments<Cursor>) => Promise<Record[]>,
  aggregate: () => Promise<number>,
  args: ConnectionArguments = {},
  pOptions?: Options<Record, Cursor, Node, CustomEdge>
): Promise<Connection<Node, CustomEdge>> {
  // Make sure the connection arguments are valid and throw an error otherwise
  // istanbul ignore next
  if (!validateArgs(args)) {
    throw new Error('This code path can never happen, only here for type safety');
  }

  const options = mergeDefaultOptions(pOptions);
  const requestedFields = options.resolveInfo && Object.keys(graphqlFields(options.resolveInfo));
  const hasRequestedField = (key: string) => !requestedFields || requestedFields.includes(key);

  let records: Array<Record>;
  let totalCount: number;
  let hasNextPage: boolean;
  let hasPreviousPage: boolean;

  if (isForwardPagination(args)) {
    // Fetch one additional record to determine if there is a next page
    args.first = Math.min(args.first, MAX_LIMIT);
    const take = args.first + 1;

    // Convert `after` into prisma `cursor` & `skip`
    const cursor = decodeCursor(args.after, options);
    const skip = cursor ? 1 : undefined;

    // Execute the underlying query operations
    records = await findMany({ cursor, take, skip });
    totalCount = hasRequestedField('totalCount') ? await aggregate() : -1;

    // See if we are "after" another record, indicating a previous page
    hasPreviousPage = !!args.after;

    // See if we have an additional record, indicating a next page
    hasNextPage = records.length > args.first;

    // Remove the extra record (last element) from the results
    if (hasNextPage) records.pop();
  } else if (isBackwardPagination(args)) {
    // Fetch one additional record to determine if there is a previous page
    args.last = Math.min(args.last, MAX_LIMIT);
    const take = -1 * (args.last + 1);

    // Convert `before` into prisma `cursor` & `skip`
    const cursor = decodeCursor(args.before, options);
    const skip = cursor ? 1 : undefined;

    // Execute the underlying query operations
    records = await findMany({ cursor, take, skip });
    totalCount = hasRequestedField('totalCount') ? await aggregate() : -1;

    // See if we are "before" another record, indicating a next page
    hasNextPage = !!args.before;

    // See if we have an additional record, indicating a previous page
    hasPreviousPage = records.length > args.last;

    // Remove the extra record (first element) from the results
    if (hasPreviousPage) records.shift();
  } else {
    // Execute the underlying query operations
    records = hasRequestedField('edges') || hasRequestedField('nodes') ? await findMany({}) : [];
    totalCount = hasRequestedField('totalCount') ? await aggregate() : -1;

    // Since we are getting all records, there are no pages
    hasNextPage = false;
    hasPreviousPage = false;
  }

  // The cursors are always the first & last elements of the result set
  const startCursor = records.length > 0 ? encodeCursor(records[0], options) : undefined;
  const endCursor = records.length > 0 ? encodeCursor(records[records.length - 1], options) : undefined;

  const edges = records.map((record) => {
    return {
      ...options.recordToEdge(record),
      cursor: encodeCursor(record, options)
    } as CustomEdge;
  });

  return {
    edges,
    nodes: edges.map((edge) => edge.node),
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor, totalCount }
  };
}

function isNullOrUndefined(value: unknown): boolean {
  return value === null || value === undefined;
}

function validateArgs(args: ConnectionArguments): args is ConnectionArgumentsUnion {
  // Only one of `first` and `last` / `after` and `before` can be set
  if (!isNullOrUndefined(args.first) && !isNullOrUndefined(args.last)) {
    throw GqlBadRequest('Only one of "first" and "last" can be set');
  }

  if (!isNullOrUndefined(args.after) && !isNullOrUndefined(args.before)) {
    throw GqlBadRequest('Only one of "after" and "before" can be set');
  }

  // If `after` is set, `first` has to be set
  if (!isNullOrUndefined(args.after) && isNullOrUndefined(args.first)) {
    throw GqlBadRequest('"after" needs to be used with "first"');
  }

  // If `before` is set, `last` has to be set
  if (!isNullOrUndefined(args.before) && isNullOrUndefined(args.last)) {
    throw GqlBadRequest('"before" needs to be used with "last"');
  }

  // `first` and `last` have to be positive
  if (!isNullOrUndefined(args.first) && args.first <= 0) {
    throw GqlBadRequest('"first" has to be positive');
  }

  if (!isNullOrUndefined(args.last) && args.last <= 0) {
    throw GqlBadRequest('"last" has to be positive');
  }

  return true;
}

type ConnectionArgumentsUnion = ForwardPaginationArguments | BackwardPaginationArguments | NoPaginationArguments;

type ForwardPaginationArguments = { first: number; after?: string };
type BackwardPaginationArguments = { last: number; before?: string };
type NoPaginationArguments = Record<string, unknown>;

type MergedOptions<Record, Cursor, Node, CustomEdge extends Edge<Node>> = Required<
  Options<Record, Cursor, Node, CustomEdge>
>;

function mergeDefaultOptions<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  pOptions?: Options<Record, Cursor, Node, CustomEdge>
): MergedOptions<Record, Cursor, Node, CustomEdge> {
  return {
    getCursor: (record: Record) => ({ id: (record as unknown as { id: string }).id }) as unknown as Cursor,
    encodeCursor: (cursor: Cursor) => (cursor as unknown as { id: string }).id,
    decodeCursor: (cursorString: string) => ({ id: cursorString }) as unknown as Cursor,
    recordToEdge: (record: Record) => ({ node: record }) as unknown as Omit<CustomEdge, 'cursor'>,
    resolveInfo: null,
    ...pOptions
  };
}

function isForwardPagination(args: ConnectionArgumentsUnion): args is ForwardPaginationArguments {
  return 'first' in args && !isNullOrUndefined(args.first);
}

function isBackwardPagination(args: ConnectionArgumentsUnion): args is BackwardPaginationArguments {
  return 'last' in args && !isNullOrUndefined(args.last);
}

function decodeCursor<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  connectionCursor: string | undefined,
  options: MergedOptions<Record, Cursor, Node, CustomEdge>
): Cursor | undefined {
  if (!connectionCursor) {
    return undefined;
  }

  return options.decodeCursor(connectionCursor);
}

function encodeCursor<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  record: Record,
  options: MergedOptions<Record, Cursor, Node, CustomEdge>
): string {
  return options.encodeCursor(options.getCursor(record));
}
