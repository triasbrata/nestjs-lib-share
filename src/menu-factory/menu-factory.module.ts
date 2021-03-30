import { DynamicModule, Type } from '@nestjs/common';
import { IMenuFactory } from './types/menu-factory.type';

export class MenuFactoryModule {
  static forRoot(factory: Type<IMenuFactory>): DynamicModule {
    return {
      global: true,
      module: MenuFactoryModule,
      providers: [
        {
          provide: 'menu-factory',
          useClass: factory,
        },
      ],
      exports: [
        {
          provide: 'menu-factory',
          useClass: factory,
        },
      ],
    };
  }
}
