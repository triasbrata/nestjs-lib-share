import { DynamicModule, HttpModule, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'class-validator';
import { BrowserModule } from '../browser/browser.module';
import { ScraperHtmlModule } from '../scraper-html/scraper-html.module';
import { SCRAPER_MODULE_OPTIONS } from './constants/scraper-webisite.constatn';
import { ScraperWebsiteService } from './scraper-website.service';
import { CanScrape, DefaultScraper } from './types/can-scrape.type';
import { EngineType } from './types/engine.type';
import { ScraperWebsiteModuleOptions } from './types/scraper-website-module-options.type';

@Module({
  imports: [ScraperHtmlModule],
})
export class ScraperWebsiteModule {
  static register(
    canScrape = CanScrape.ALL,
    engineType?: EngineType,
  ): DynamicModule {
    return {
      module: ScraperWebsiteModule,
      imports: [BrowserModule.register({})],
      exports: [ScraperWebsiteService],
      providers: [
        ScraperWebsiteService,
        { provide: 'canScrape', useValue: canScrape },
        { provide: 'engineType', useValue: engineType || '' },
        {
          provide: SCRAPER_MODULE_OPTIONS,
          useFactory(
            config: ConfigService,
            canScrape,
            engineType,
          ): ScraperWebsiteModuleOptions {
            const defaultScraper =
              canScrape === CanScrape.POST || canScrape === CanScrape.ALL
                ? CanScrape.POST
                : CanScrape.REPLY;
            let engine = engineType;
            if (isEmpty(engine)) {
              engine = config
                .get<string>('ENGINE', 'html')
                .toLocaleLowerCase() as EngineType;
            }
            return { defaultScraper, canScrape: canScrape, engineType: engine };
          },
          inject: [ConfigService, 'canScrape', 'engineType'],
        },
      ],
    };
  }
}
