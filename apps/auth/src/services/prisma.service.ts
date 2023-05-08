import { sanitiseWhereMiddleware } from '@incognito/toolkit/dist/prisma/prisma';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@/.prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    this.$use(sanitiseWhereMiddleware);

    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await this.$disconnect();
      await app.close();
    });
  }
}
