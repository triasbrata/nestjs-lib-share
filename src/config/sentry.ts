import { ConfigService } from '@nestjs/config';

export const sentryConfig = {
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
