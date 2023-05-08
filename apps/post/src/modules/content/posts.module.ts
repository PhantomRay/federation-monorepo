import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { formatError } from '@/common/graphql.error.formatter';
import { ConfigModule } from '@/config/config.module';
import { ConfigService } from '@/config/config.service';

import { PostService } from './post.service';
import { PostsResolver } from './posts.resolver';

const { NODE_ENV } = process.env;

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'user' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.config.JWT_SECRET
      }),
      inject: [ConfigService]
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      // autoSchemaFile: {
      //   federation: 2
      // },
      typePaths: ['**/*.gql'],
      playground: false,
      formatError,
      plugins: [...(NODE_ENV === 'local' ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })] : [])]
    })
  ],
  providers: [ConfigService, PostService, PostsResolver],
  exports: []
})
export class PostModule {}
