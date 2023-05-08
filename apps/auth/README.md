# Auth Service

REST API based auth service backed by Postgresql.

## Running the app

```bash
# development
$ pnpm --filter auth dev

# production
$ pnpm --filter auth start:prod
```

## Test

```bash
# unit tests
$ pnpm --filter auth test

# e2e tests
# prepare database
$ pnpm --filter auth db:push:test
$ pnpm --filter auth test:e2e

# test coverage
$ pnpm --filter auth run test:cov
```

![e2e testing](docs/e2e.png)

## Swagger

Visit http://localhost:3001/api

![swagger](docs/swagger.png)
