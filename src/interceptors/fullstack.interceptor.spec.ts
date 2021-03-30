import { SessionInterceptor } from './session.interceptor';

describe('FullstackInterceptor', () => {
  it('should be defined', () => {
    expect(new SessionInterceptor()).toBeDefined();
  });
});
