import { UserJwtStrategy } from '@incognito/toolkit/dist/auth/user.strategy';
import { EventService } from '@incognito/toolkit/dist/event.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@/config/config.module';
import { ConfigService } from '@/config/config.service';
import { AuthService } from '@/domain/services/auth';
import { UserService } from '@/domain/services/user';
import { PrismaService } from '@/services/prisma.service';

import { AuthController } from './auth.controller';
import { EmailController } from './email.controller';
import { MobileController } from './mobile.controller';
import { TokenController } from './token.controller';
import { UserController } from './user.controller';

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
  controllers: [AuthController, MobileController, TokenController, EmailController, UserController],
  providers: [AuthService, ConfigService, EventService, UserJwtStrategy, UserService, PrismaService]
})
export class AuthModule {}
