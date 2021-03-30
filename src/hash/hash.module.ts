import { Global, Module } from '@nestjs/common';
import { Hash } from './hash';

@Global()
@Module({
  providers: [Hash],
  exports: [Hash],
})
export class HashModule {}
