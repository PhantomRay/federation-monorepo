import { Module } from '@nestjs/common';

import { ConfigModule } from '@/config/config.module';
import { AuthModule } from '@/modules/auth/auth.module';

import { PostModule } from './modules/content/posts.module';

@Module({
  imports: [ConfigModule, PostModule, AuthModule]
})
export class AppModule {}
