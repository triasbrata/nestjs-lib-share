import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { exception } from 'console';
import { Request, Response } from 'express';
import { inspect } from 'util';
import { EdgeViewService } from '../edge-view/edge-view.service';
import { RedirectWithErrorException } from '../exception/redirect-with-error-exception';
import { redirect } from '../helpers/fullstack-helper';
import { RequestWithFlash } from '../types/request-flash.type';
import { ResponseToClient } from '../types/response-to-client';
import { object } from 'dot-object';
@Catch(HttpException)
@Injectable()
export class FullstackFilter<T extends HttpException>
  implements ExceptionFilter {
  logger = new Logger(FullstackFilter.name);
  constructor(private readonly view: EdgeViewService) {}
  async catch(e: T, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<RequestWithFlash>();
    if (Object.keys(req.body).length > 0) {
      const oldVal = { ...req.body };
      object(oldVal);
      req.session.flashMessage = {
        ...req.session.flashMessage,
        old: oldVal,
      };
      new Promise(res => req.session.save(res));
    }
    req.isAuthenticated();
    const execptionRes = e.getResponse() as Record<string, any>;
    if (req.headers['accept']) {
      const accepts = req.headers['accept'].split(',');
      if (accepts.includes('application/json')) {
        const resPayload: ResponseToClient<any> = {
          result:
            e instanceof BadRequestException
              ? execptionRes?.message?.validation
              : execptionRes?.message || execptionRes?.content,
          metaData: {
            isError: true,
            statusCode: execptionRes?.statusCode,
            message: execptionRes?.title || e.message,
          },
        };
        return res.status(execptionRes?.statusCode || 400).json(resPayload);
      }
    }
    if (e instanceof RedirectWithErrorException) {
      const msg =
        typeof e.getResponse() === 'string'
          ? { content: e.getResponse() }
          : (e.getResponse() as object);
      await req.flash('message', [
        {
          ...msg,
          type: 'danger',
        },
      ]);
      return res.redirect(e.redirect);
    }
    if (e instanceof BadRequestException) {
      if (execptionRes?.message?.validation) {
        await req.flash('errors', execptionRes.message.validation);
        return res.redirect(req.headers['referer']);
      }
    }
    return res.send(
      this.view.render('lib::error', {
        code: e.getStatus(),
        message: e.message,
        url: req.user ? 'dashboard' : 'login',
      }),
    );
  }
}
