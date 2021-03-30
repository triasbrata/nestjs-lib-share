import { Test, TestingModule } from '@nestjs/testing';
import { ConfigableService } from './configable.service';

describe('ConfigableService', () => {
  let service: ConfigableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigableService],
    }).compile();

    service = module.get<ConfigableService>(ConfigableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
