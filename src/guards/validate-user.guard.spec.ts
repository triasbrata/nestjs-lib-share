import { ValidateUserGuard } from './validate-user.guard';

describe('ValidateUserGuard', () => {
  it('should be defined', () => {
    expect(new ValidateUserGuard()).toBeDefined();
  });
});
