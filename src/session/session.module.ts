import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SessionService } from './session.service';
import * as session from 'express-session';
import * as passport from 'passport';
import * as sfs from 'session-file-store';
import { SessionMiddleware } from './session.middleware';
@Module({
  providers: [SessionService],
})
export class SessionModule implements NestModule {
  constructor(private readonly sesionservice: SessionService) {}
  configure(consumer: MiddlewareConsumer) {
    const FileStore = sfs(session);
    const middlewares = [
      session({
        ...this.sesionservice.getSessionConfig(),
        store: new FileStore({}),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
          // secure: true, // becareful set this option, check here: https://www.npmjs.com/package/express-session#cookiesecure. In local, if you set this to true, you won't receive flash as you are using `http` in local, but http is not secure
        },
      }),
    ];
    if (this.sesionservice.withPassport) {
      middlewares.push(passport.initialize(), passport.session());
    }
    consumer
      .apply(...middlewares, SessionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

  static forRoot(usePassport = false): DynamicModule {
    return {
      module: SessionModule,
      providers: [
        {
          provide: 'session:use-passport',
          useValue: usePassport,
        },
      ],
    };
  }
}
