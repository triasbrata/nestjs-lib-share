import { Test, TestingModule } from '@nestjs/testing';
import { ScraperPlaywrightService } from './scraper-playwright.service';

describe('ScraperPlaywrightService', () => {
  let service: ScraperPlaywrightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperPlaywrightService],
    }).compile();

    service = module.get<ScraperPlaywrightService>(ScraperPlaywrightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
