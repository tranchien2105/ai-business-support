import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AiModule } from './ai/ai.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { EmbeddingService } from './rag/embedding/embedding.service.js';
import { RagModule } from './rag/rag.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),

        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),

    AiModule,
    OrdersModule,
    RagModule,
  ],

  controllers: [AppController],

  providers: [AppService, EmbeddingService],
})
export class AppModule { }