import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmConfig } from './typeorm-config';

@Module({
  exports:[TypeOrmConfig],
  providers:[TypeOrmConfig],
})
export class TypeormConfigModule {
  static register(maxConLimit = 5, defaultConfig= 'database'):DynamicModule{
    return {
      module: TypeormConfigModule,
      providers:[
        {provide:'maxConLimit', useValue:maxConLimit},
        {provide:'defaultConfig', useValue:defaultConfig},
      ]
    }
  }
}
