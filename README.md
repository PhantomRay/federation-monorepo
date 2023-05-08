# GQL federation monorepo

This is a monorepo for a GraphQL federation project. The following tools are used:

- [nestjs](https://nestjs.com/) for backend framework
- [apollo-server](https://www.apollographql.com/docs/apollo-server/) for GraphQL server
- [apollo-federation](https://www.apollographql.com/docs/federation/) for GraphQL federation
- [prisma](https://www.prisma.io/) for database access
- [pnpm](https://pnpm.io/) for package management
- [turborepo](https://turbo.build/) for monorepo management
- [eslint](https://eslint.org/) for linting
- [prettier](https://prettier.io/) for formatting
- [jest](https://jestjs.io/) for testing

## Project structure

```sh
.
├── README.md
├── apps # contains all services
│   ├── auth # rest api
│   ├── post # post subgraph
│   └── user # user subgraph
├── docker
│   └── docker-compose.yml
├── docs
├── infra # contains all infrastructure related code
├── package.json # contains dependencies for monorepo
├── packages # config-* for shared configurations
│   ├── config-eslint
│   ├── config-jest
│   ├── config-ts
│   └── toolkit # shared code
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json # turborepo setup
```

This monorepo contains the following apps:

- [auth](apps/auth/README.md)
- [user](apps/user/README.md)
- [post](apps/post/README.md)

Shared configurations are located in `packages/config*`.

## Dependencies

```sh
pnpm i -w
```

## Generate supergraph schema

First, start all subgraphs

```sh
pnpm dev
```

Generate supergraph

```sh
pnpm supergraph
```

## Start Apollo Router

```sh
pnpm start:router
```

## Database

PostgreSQL is required for auth service. Use `docker/docker-compose.yml` to start one. Then run `pnpm --filter auth migrate:dev` to initialise database.
