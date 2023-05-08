# Post subgraph

## Running the app

```bash
# development
$ pnpm --filter post dev

# production mode
$ pnpm --filter post start:prod
```

## Test

```bash
# unit tests
$ pnpm --filter post test

# e2e tests
# prepare database
$ pnpm --filter post db:push:test
$ pnpm --filter post test:e2e

# test coverage
$ pnpm --filter post run test:cov
```

## Generate typings

```bash
$ pnpm --filter post run typings
```
