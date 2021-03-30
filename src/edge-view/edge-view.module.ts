import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EdgeViewService } from './edge-view.service';
import {
  EngineModuleSetting,
  EngineSettings,
} from './types/engine-settings.type';
import { EdgeMiddleware } from './edge.middleware';
import { CaslModule } from '../casl/casl.module';

@Module({ providers: [EdgeViewService] })
export class EdgeViewModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EdgeMiddleware).forRoutes('*');
  }
  static forRoot(conf: EngineModuleSetting): DynamicModule {
    return {
      global: true,
      module: EdgeViewModule,
      imports: [CaslModule],
      exports: [EdgeViewService],
      providers: [
        EdgeViewService,
        {
          provide: 'engine.settings',
          useFactory(cs: ConfigService): EngineSettings {
            return {
              cache: cs.get('NODE_ENV', 'dev') === 'production',
              mountPoint: [
                ...(conf.mountingPoints || []),
                { path: conf.defaultPath, namespace: 'default' },
              ],
            };
          },
          inject: [ConfigService],
        },
      ],
    };
  }
}
