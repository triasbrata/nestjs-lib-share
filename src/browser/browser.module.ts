import { Provider } from '@nestjs/common';
import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'class-validator';
import { Browser } from './Browser';
import { BROWSER_MODULE_OPTIONS } from './const/browser.constanta';
import {
  BrowserAsyncOptions,
  BrowserOptions,
} from './types/browser-options.type';
@Module({
  imports: [HttpModule],
  providers: [Browser],
  exports: [Browser],
})
export class BrowserModule {
  static register(options: BrowserOptions): DynamicModule {
    return {
      module: BrowserModule,
      providers: this.createProviders(options),
    };
  }
  static createProviders(options: BrowserOptions): Provider<any>[] {
    return [
      {
        provide: BROWSER_MODULE_OPTIONS,
        useFactory(config: ConfigService) {
          const browserOptions: Partial<BrowserOptions> = { ...options };
          if (isEmpty(browserOptions.fastmode)) {
            browserOptions.headless =
              config.get<string>('HEADLESS', 'true').toLocaleLowerCase() ===
              'true';
          }
          if (isEmpty(browserOptions.fastmode)) {
            browserOptions.fastmode =
              config.get<string>('FAST_MODE', 'true').toLocaleLowerCase() ===
              'true';
          }
          return browserOptions;
        },
        inject: [ConfigService],
      },
    ];
  }
  static registerAsync(options: BrowserAsyncOptions): DynamicModule {
    return {
      module: BrowserModule,
      imports: options.imports || [],
      providers: [
        {
          provide: BROWSER_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }
}
