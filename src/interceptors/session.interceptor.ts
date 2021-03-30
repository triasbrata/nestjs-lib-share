import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { Response, Request } from 'express';
import { map, mergeMap, tap } from 'rxjs/operators';
import { genereateURL } from '../helpers/fullstack-helper';
import { FlashMessage } from '../types/fullstack/flash-message';
import { RENDER_METADATA } from '@nestjs/common/constants';
import { RequestWithFlash } from '../types/request-flash.type';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const httpContext = context.switchToHttp();
      const req = httpContext.getRequest<RequestWithFlash>();
      const response = httpContext.getResponse<Response>();
      const session: typeof req.session & Record<string, any> = req.session;
      if (!session) {
        return next.handle();
      }
      const handleMessage = async (
        res: Partial<{
          _message: FlashMessage;
          _redirect: string;
        }>,
      ) => {
        if (res._message) {
          await req.flash('message', res._message);
          delete res._message;
        }
        return res;
      };
      const handleRedirect = (res: any): void | Record<string, any> => {
        if (res._redirect) {
          const redirect = genereateURL(res._redirect);
          delete res._redirect;
          return response.redirect(redirect);
        }
        return res;
      };
      return next.handle().pipe(
        map(res => {
          if (typeof res !== 'object') {
            throw new InternalServerErrorException('response must be object');
          }
          return res;
        }),
        mergeMap(async res => {
          session.flashMessage = {};
          await new Promise(res => session.save(res));
          return res;
        }),
        mergeMap(handleMessage),
        map(handleRedirect),
      );
    }
    return next.handle();
  }
}
