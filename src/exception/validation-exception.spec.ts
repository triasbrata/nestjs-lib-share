import { ValidationException } from './validation-exception';

describe('ValidationException', () => {
  it('should be defined', () => {
    expect(new ValidationException()).toBeDefined();
  });
});
