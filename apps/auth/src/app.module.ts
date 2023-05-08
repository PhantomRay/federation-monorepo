import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule]
})
export class AppModule {}
