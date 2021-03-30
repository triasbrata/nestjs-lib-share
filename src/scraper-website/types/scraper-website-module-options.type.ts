import { DefaultScraper, CanScrape } from './can-scrape.type';
import { EngineType } from './engine.type';

export interface ScraperWebsiteModuleOptions {
  defaultScraper: DefaultScraper;
  canScrape: CanScrape;
  engineType: EngineType;
}
