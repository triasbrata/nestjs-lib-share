import { Test, TestingModule } from '@nestjs/testing';
import { DecodeIdValidator } from './decode-id';

describe('DecodeId', () => {
  let provider: DecodeIdValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DecodeIdValidator],
    }).compile();

    provider = module.get<DecodeIdValidator>(DecodeIdValidator);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
