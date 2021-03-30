import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostmarkEmail } from './email-providers/postmark';
import { Mailer } from './mailer';

type emailProviderType = 'postmark';

export class MailModule {
  static use(emailProvider: emailProviderType = 'postmark'): DynamicModule {
    const provide: Provider = {
      provide: Mailer,
      useFactory(cs: ConfigService) {
        if (emailProvider === 'postmark') {
          return new PostmarkEmail(cs);
        }
      },
      inject: [ConfigService],
    };
    return {
      module: MailModule,
      providers: [provide],
      exports: [provide],
    };
  }
}
