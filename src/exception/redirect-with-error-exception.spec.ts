import { RedirectWithErrorException } from './redirect-with-error-exception';

describe('RedirectWithErrorException', () => {
  it('should be defined', () => {
    expect(new RedirectWithErrorException()).toBeDefined();
  });
});
