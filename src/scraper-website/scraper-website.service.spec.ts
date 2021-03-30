import { Test, TestingModule } from '@nestjs/testing';
import { ScraperWebsiteService } from './scraper-website.service';

describe('ScraperWebsiteService', () => {
  let service: ScraperWebsiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperWebsiteService],
    }).compile();

    service = module.get<ScraperWebsiteService>(ScraperWebsiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
