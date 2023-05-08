import { UserJwtStrategy } from '@incognito/toolkit/dist/auth/user.strategy';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@/config/config.module';
import { ConfigService } from '@/config/config.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'user' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.config.JWT_SECRET
      }),
      inject: [ConfigService]
    })
  ],
  providers: [UserJwtStrategy, ConfigService],
  controllers: []
})
export class AuthModule {}
