import { Global, Module } from '@nestjs/common';
import { HashModule } from '../hash/hash.module';
import { ValidationService } from './validation.service';
import { DecodeIdValidator } from './decode-id';

@Global()
@Module({
  imports: [HashModule],
  providers: [ValidationService, DecodeIdValidator],
})
export class ValidationModule {}
