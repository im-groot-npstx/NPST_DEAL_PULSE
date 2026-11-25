import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { readFileSync } from 'fs';

import { resolve } from 'path';

import { AttachmentsModule } from './attachments/attachments.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthController } from './health.controller';
import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';
import { VersionsModule } from './versions/versions.module';

@Module({

  

  imports: [

    StorageModule,
    UploadsModule,
    DocumentsModule,
    AttachmentsModule,
    VersionsModule,

    ConfigModule.forRoot({

      isGlobal: true,

      envFilePath: resolve(process.cwd(), '.env'),

    }),

    TypeOrmModule.forRootAsync({

      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({

        type: 'mysql' as const,

        host: config.getOrThrow<string>('DB_HOST'),

        port: Number(config.get<string>('DB_PORT', '16659')),

        username: config.getOrThrow<string>('DB_USER'),

        password: config.getOrThrow<string>('DB_PASSWORD'),

        database: config.getOrThrow<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize: false,

        ssl: (() => {
          const sslCa = config.get<string>('DB_SSL_CA');
          if (!sslCa) {
            return undefined;
          }
          return {
            ca: readFileSync(resolve(process.cwd(), sslCa)),
            rejectUnauthorized: true,
          };
        })(),

        retryAttempts: 5,

        retryDelay: 3000,

        connectTimeout: 10000,

      }),

    }),

  ],

  controllers: [HealthController],

  providers: [],

})

export class AppModule {}
 