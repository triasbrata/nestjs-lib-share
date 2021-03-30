import { ConfigService } from '@nestjs/config';
import { Mailer } from '../mailer';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as postmarkTransport from 'nodemailer-postmark-transport';

export class PostmarkEmail extends Mailer {
  transport: Mail;
  constructor(private readonly config: ConfigService) {
    super();
    // this.transport = createTransport({
    //   name: 'postmark',
    //   auth: {
    //     user: this.config.get('POSTMARK_API'),
    //     pass: this.config.get('POSTMARK_API'),
    //   },
    //   host: 'smtp.postmarkapp.com',
    //   port: 2525,
    //   requireTLS: true,
    //   sender: {
    //     name: 'Robot Surel',
    //     address: 'noreply@robot-surel.com',
    //   },
    //   replyTo: {
    //     name: 'Robot Surel',
    //     address: 'noreply@robot-surel.com',
    //   },
    // });
    this.transport = createTransport(
      postmarkTransport({
        auth: {
          apiKey: this.config.get('POSTMARK_API'),
        },
      }),
    );
  }
  async sendMessage(opts: Mail.Options): Promise<void> {
    await this.transport.sendMail({
      ...opts,
      sender: {
        name: 'Robot Surel',
        address: 'noreply@robot-surel.com',
      },
      replyTo: {
        name: 'Robot Surel',
        address: 'noreply@robot-surel.com',
      },
      from: {
        name: 'Robot Surel',
        address: 'noreply@robot-surel.com',
      },
    });
  }
}
