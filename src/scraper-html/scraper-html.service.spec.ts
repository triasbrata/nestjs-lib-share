import { Test, TestingModule } from '@nestjs/testing';
import { ScraperHtmlService } from './scraper-html.service';

describe('ScraperHtmlService', () => {
  let service: ScraperHtmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperHtmlService],
    }).compile();

    service = module.get<ScraperHtmlService>(ScraperHtmlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
