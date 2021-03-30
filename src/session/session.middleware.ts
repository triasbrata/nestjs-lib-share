import { Injectable, NestMiddleware } from '@nestjs/common';
import { genereateURL } from '../helpers/fullstack-helper';
import { object } from 'dot-object';
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    req.session.flashMessage = { ...(req.session.flashMessage || {}) };
    req.flash = (key: string, value: any) => {
      req.session.flashMessage[key] = value;
      return new Promise(res => req.session.save(res));
    };
    // if (Object.keys(req.body).length > 0) {
    //   const oldVal = { ...req.body };
    //   object(oldVal);
    //   // await req.flash('old', oldVal);
    // }
    return next();
  }
}
