import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Edge, GLOBALS } from 'edge.js';
import { EngineSettings } from './types/engine-settings.type';
import { Application } from 'express';
import { GLOBAL_HELPER } from './helpers/globals';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EdgeViewService implements OnApplicationBootstrap {
  render(path: string, state: Record<string, any>): string {
    return this.engine.render(path, state);
  }
  readonly engine: Edge;
  constructor(
    @Inject('engine.settings') private readonly config: EngineSettings,
    private readonly adapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {
    this.engine = new Edge({
      cache: config.cache,
    });
    for (const mountPoint of config.mountPoint) {
      this.engine.mount(mountPoint.namespace, mountPoint.path);
    }
  }
  onApplicationBootstrap() {
    Object.keys(GLOBAL_HELPER).forEach(key =>
      this.engine.global(key, GLOBAL_HELPER[key].bind(GLOBAL_HELPER)),
    );
    Object.keys(GLOBALS).forEach(key => this.engine.global(key, GLOBALS[key]));
    this.engine.global('env', (key: string, defaultValue?: string) =>
      this.configService.get(key, defaultValue),
    );
    const app = this.adapterHost.httpAdapter.getInstance<Application>();
    app.set(
      'views',
      this.config.mountPoint.map(it => it.path),
    );
    app.engine(
      'edge',
      (filepath: string, options: Record<string, any>, callback: any) => {
        try {
          const result = this.engine.render(filepath, options);
          return callback(null, result);
        } catch (e) {
          return callback(e);
        }
      },
    );
    app.set('view engine', 'edge');
  }
}
