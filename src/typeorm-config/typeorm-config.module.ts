import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmConfig } from './typeorm-config';

@Module({
  exports:[TypeOrmConfig],
  providers:[TypeOrmConfig],
})
export class TypeormConfigModule {
  static register(maxConLimit = 5):DynamicModule{
    return {
      module: TypeormConfigModule,
      providers:[
        {provide:'maxConLimit', useValue:maxConLimit},
      ]
    }
  }
}
