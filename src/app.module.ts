import { join } from 'path';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TranslationsModule } from './translations/translations.module';

import joi from 'joi';

import { Translation } from './translations/entities/translation.entity';
import { Project } from './translations/entities/project.entity';
import { CommonModule } from './common/common.module';
import { Task } from './translations/entities/task.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Assignee } from './translations/entities/assignee.entity';
import { Language } from './translations/entities/language.entity';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SearchModule } from './search/search.module';
import { TranslationSearchModule } from './translation-search/translation-search.module';
import { AutoTranslateModule } from './auto-translate/auto-translate.module';
import { KafkaModule } from './kafka/kafka.module';

import { SentryModule } from '@ntegral/nestjs-sentry';
import { LogLevel } from '@sentry/types';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphqlInterceptor } from '@ntegral/nestjs-sentry';

@Module({
  imports: [
    GraphQLModule.forRoot({
      debug: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
      context: ({ req }) => ({
        user: req ? req['user'] : {},
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: joi.object({
        NODE_ENV: joi.string().valid('dev', 'prod', 'test'),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.string().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_NAME: joi.string().required(),
        ELASTICSEARCH_NODE: joi.string().required(),
        ELASTICSEARCH_USERNAME: joi.string().required(),
        ELASTICSEARCH_PASSWORD: joi.string().required(),
        SENTRY_DSN: joi.string().required(),
        GOOGLE_APPLICATION_CREDENTIALS: joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Translation, Project, Task, User, Assignee, Language],
      synchronize: false,
      logging: ['error'],
    }),
    JwtModule.forRoot({
      isGlobal: true,
      secretKey: process.env.SECRET_KEY,
    }),
    KafkaModule.register({
      clientId: 'translation-api-client',
      brokers: ['localhost:9092'],
      groupId: 'translation-api-group',
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: process.env.NODE_ENV !== 'production',
      environment: process.env.NODE_ENV,
      logLevel:
        process.env.NODE_ENV !== 'production' ? LogLevel.Debug : LogLevel.Error,
    }),
    TranslationsModule,
    CommonModule,
    UsersModule,
    AuthModule,
    PubSubModule,
    SubscriptionModule,
    SearchModule,
    TranslationSearchModule,
    AutoTranslateModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: GraphqlInterceptor }],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: 'graphql',
      method: RequestMethod.POST,
    });
  }
}
