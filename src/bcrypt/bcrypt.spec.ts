import { Test, TestingModule } from '@nestjs/testing';
import { Bcrypt } from './bcrypt';

describe('Bcrypt', () => {
  let provider: Bcrypt;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Bcrypt],
    }).compile();

    provider = module.get<Bcrypt>(Bcrypt);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
