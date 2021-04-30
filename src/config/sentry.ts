import { ConfigService } from '@nestjs/config';
import { SentryModuleAsyncOptions } from '@ntegral/nestjs-sentry';

export const sentryConfig: SentryModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory(cfg: ConfigService) {
    return {
      dsn: cfg.get('SENTRY_DSN'),
      debug: true,
      environment: 'dev',
      release: null,
    };
  },
};
