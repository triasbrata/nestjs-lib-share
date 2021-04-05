import { HttpModule, Module } from '@nestjs/common';
import { Agent } from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ScraperHtmlService } from './scraper-html.service';

@Module({
  imports: [HttpModule.register({httpsAgent: new Agent({rejectUnauthorized:false})})],
  providers: [ScraperHtmlService],
  exports: [ScraperHtmlService],
})
export class ScraperHtmlModule {}
