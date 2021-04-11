import { Module } from '@nestjs/common';
import { PlaywrightModule } from '../playwright/playwright.module';
import { ScraperPlaywrightService } from './scraper-playwright.service';

@Module({
  imports:[PlaywrightModule],
  providers: [ScraperPlaywrightService],
  exports:[ScraperPlaywrightService]
})
export class ScraperPlaywrightModule {}
