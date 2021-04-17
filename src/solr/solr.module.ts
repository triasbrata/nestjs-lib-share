import {
  DynamicModule,
  HttpModule,
  HttpService,
  Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolrClient } from './solr-client';
const createProviders =  (...cores:string[]): Provider<any>[] => cores.map(core => ({
  inject: [HttpService],
  provide: core,
  useFactory(httpService: HttpService) {
    return new SolrClient(core, httpService);
  },
}));
export class SolrModule {

  static register(...cores: string[]) {
    return {
      module: SolrModule,
      imports: [
        HttpModule.registerAsync({
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              baseURL: `http://${config.get('SOLR_HOST')}:${config.get('SOLR_PORT')}/solr/`,
              headers: {
                'content-type': 'application/json',
              },
            };
          },
        }),
      ],
      providers: [...createProviders(...cores)],
      exports: [...createProviders(...cores)],
    } as DynamicModule;
  }
  static registerServerPort(server:string, port:string, ...cores:string[]){
    return {
      module: SolrModule,
      imports: [
        HttpModule.registerAsync({
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              baseURL: `http://${server}:${port}/solr/`,
              headers: {
                'content-type': 'application/json',
              },
            };
          },
        }),
      ],
      providers: [...createProviders(...cores)],
      exports: [...createProviders(...cores)],
    } as DynamicModule;
  }
}
