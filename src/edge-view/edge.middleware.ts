import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { RequestWithFlash } from '../types/request-flash.type';
import { EdgeViewService } from './edge-view.service';
import * as lodash from 'lodash';
import { FlashMessage } from '../types/fullstack/flash-message';
import { AppAbility, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PolicyHandler } from '../types/policy-handler.type';
import { Action } from '../types/action.enum';
import { Subject } from '../types/subject.enum';
type ErrorMessage = {
  field: string;
  message: string;
};
type FlashContent = Partial<{
  old: Record<string, any>;
  errors: ErrorMessage[];
  message: FlashMessage[];
}>;
@Injectable()
export class EdgeMiddleware implements NestMiddleware {
  logger = new Logger(EdgeMiddleware.name);
  constructor(
    readonly edgeService: EdgeViewService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async use(req: any, res: any, next: () => void) {
    const isAuth = this.haveAuth(req);

    const ability: AppAbility = isAuth
      ? this.caslAbilityFactory.createForUser(req.user)
      : null;
    this.registerUserAndRequest(isAuth, req);
    this.registerFlash(req);
    this.registerCasl(ability);
    next();
  }

  private registerUserAndRequest(isAuth: any, req: any) {
    this.edgeService.engine.global('User', () =>
      isAuth ? req.user : { name: 'Anonymous' },
    );
    this.edgeService.engine.global('query', (key?:string) => key ? req.query?.[key] || null: req.query);
    this.edgeService.engine.global('param', (key?: string) => {
      return req?.params?.[key];
    });
  }

  private registerCasl(ability: AppAbility) {
    this.edgeService.engine.global(
      'can',
      (action: Action, subject: Subject) => {
        if (ability) {
          return ability.can(action, subject);
        }
        return false;
      },
    );
    this.edgeService.engine.global(
      'cant',
      (action: Action, subject: Subject) => {
        if (ability) {
          return ability.cannot(action, subject);
        }
        return false;
      },
    );
  }

  private registerFlash(req: any) {
    const flashContent: FlashContent = req.session?.flashMessage || {};
    this.edgeService.engine.global('old', (key?: string, def?: any) => {
      if (flashContent.old && key) {
        return lodash.get(flashContent.old, key, def);
      } else if (key) {
        return def;
      } else {
        return flashContent.old;
      }
    });
    this.edgeService.engine.global('error', (key?: string) => {
      if (flashContent.errors) {
        return key
          ? flashContent.errors.find(e => e.field === key)?.message
          : flashContent.errors;
      }
      return '';
    });
    this.edgeService.engine.global('hasError', (key?: string) => {
      if (flashContent.errors) {
        const res = flashContent.errors.findIndex(e => e.field === key) !== -1;
        if (res) {
          return res;
        }
      }
      return false;
    });
    this.edgeService.engine.global('message', () => {
      if (flashContent.message) {
        return flashContent.message;
      }
      return [];
    });
  }

  private haveAuth(req: any) {
    return typeof req.isAuthenticated === 'function'
      ? req.isAuthenticated()
      : false;
  }
}
