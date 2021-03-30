import Mail from 'nodemailer/lib/mailer';

export abstract class Mailer {
  abstract sendMessage(opts: Mail.Options): Promise<void>;
}
