import {
  Inject,
  Injectable,
  MiddlewareConsumer,
  NestModule,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';

@Injectable()
export class SessionService {
  getSessionConfig(): session.SessionOptions {
    return {
      secret: this.configService.get('SESSION_KEY', 'iniG@y4GuA'),
      resave: false,
      saveUninitialized: true,
    };
  }
  get withPassport() {
    return this.usePassport;
  }
  constructor(
    private readonly configService: ConfigService,
    @Inject('session:use-passport') private readonly usePassport: boolean,
  ) {}
}
