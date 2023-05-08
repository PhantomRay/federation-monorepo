# User subgraph

## Running the app

```bash
# development
$ pnpm --filter user dev

# production mode
$ pnpm --filter user start:prod
```

## Test

```bash
# unit tests
$ pnpm --filter user test

# e2e tests
# prepare database
$ pnpm --filter user db:push:test
$ pnpm --filter user test:e2e

# test coverage
$ pnpm --filter user run test:cov
```

## Generate typings

```bash
$ pnpm --filter user run typings
```
