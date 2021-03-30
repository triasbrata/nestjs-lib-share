import { HttpModule, Module } from '@nestjs/common';
import { ScraperHtmlService } from './scraper-html.service';

@Module({
  imports: [HttpModule],
  providers: [ScraperHtmlService],
  exports: [ScraperHtmlService],
})
export class ScraperHtmlModule {}
