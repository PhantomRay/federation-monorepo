import { Module } from '@nestjs/common';

import { ConfigModule } from '@/config/config.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [ConfigModule, UsersModule, AuthModule]
})
export class AppModule {}
