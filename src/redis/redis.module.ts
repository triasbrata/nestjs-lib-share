import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
const redis: Provider = {
  provide: 'redis',
  useFactory(conf: ConfigService) {
    return new IORedis();
  },
  inject: [ConfigService],
};

@Module({
  providers: [redis],
  exports: [redis],
})
export class RedisModule {}
