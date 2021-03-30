import {
  DynamicModule,
  HttpModule,
  HttpService,
  Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolrClient } from './solr-client';
export class SolrModule {
  static register(...cores: string[]) {
    const providers: Provider<any>[] = cores.map(core => ({
      inject: [HttpService],
      provide: core,
      useFactory(httpService: HttpService) {
        return new SolrClient(core, httpService);
      },
    }));
    return {
      module: SolrModule,
      imports: [
        HttpModule.registerAsync({
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              baseURL: `http://${config.get('SOLR_HOST')}:${config.get(
                'SOLR_PORT',
              )}/solr/`,
              headers: {
                'content-type': 'application/json',
              },
            };
          },
        }),
      ],
      providers: [...providers],
      exports: [...providers],
    } as DynamicModule;
  }
}
