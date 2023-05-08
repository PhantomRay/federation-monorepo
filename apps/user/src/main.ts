require('./env');

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';
import { GqlBadRequestExceptionFilter } from './common/graphql.exception.filter';
import { logger } from './common/logger';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const { config }: ConfigService = new ConfigService();
  const app = await NestFactory.create(AppModule);

  if (process.env.REQUEST_LOGGER === 'true') app.use(logger);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new GqlBadRequestExceptionFilter());

  app.enableCors();

  await app.listen(config.PORT);

  console.log(`[USER] is running on port ${config.PORT}, env: ${process.env.NODE_ENV} 🚀🚀🚀`);
}

bootstrap();
