import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService, @Inject('maxConLimit') private readonly maxConLimit) {}
  createTypeOrmOptions(connectionName?: string) {

    const logging = ['error'];
    if(this.config.get('NODE_ENV', 'prod') == 'dev'){
    logging.push('query');
    }
    const fromEnv = this.config.get(connectionName === 'sonar_media' ? 'database_media' : 'database');
      const config = {
        ...fromEnv,
        type: 'mysql',
        cache: {
          type: "redis",
          options: {
              host: "localhost",
              port: 6379
          }
        },
        logging: logging,
        charset: 'utf8mb4_unicode_ci',
        extra: {
          charset: 'utf8mb4_unicode_ci',
          connectionLimit: this.maxConLimit,
        },
        autoLoadEntities: true,
      } as MysqlConnectionOptions;
    return config;
  }
}
