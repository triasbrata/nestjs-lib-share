import { Test, TestingModule } from '@nestjs/testing';
import { EdgeViewService } from './edge-view.service';

describe('EdgeViewService', () => {
  let service: EdgeViewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdgeViewService],
    }).compile();

    service = module.get<EdgeViewService>(EdgeViewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
