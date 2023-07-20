require('./env');

import { HttpExceptionFilter } from '@incognito/toolkit/dist/http.exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { ConfigService } from '@/config/config.service';

import { PrismaService } from './services/prisma.service';

async function bootstrap() {
  const { config }: ConfigService = new ConfigService();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to the DTO class
      whitelist: true // Exclude non-decorated properties from the payload
      // forbidNonWhitelisted: true
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth API')
      .setDescription('Auth API for incognito')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .setVersion(require('../package.json').version)
      .addTag('auth')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(config.PORT);

  console.log(`[Auth] is running on port ${config.PORT}, env: ${process.env.NODE_ENV} 🚀🚀🚀`);
}

bootstrap();
