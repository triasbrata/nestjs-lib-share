import { LoginGuard } from './login.guard';

describe('LocalAuthGuard', () => {
  it('should be defined', () => {
    expect(new LoginGuard()).toBeDefined();
  });
});
