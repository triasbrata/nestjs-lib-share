import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RENDER_METADATA } from '@nestjs/common/constants';
import { groupBy } from 'lodash';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { IMenuFactory } from '../menu-factory/types/menu-factory.type';
import { NavType } from '../menu-factory/types/nav.type';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Request } from 'express';
import { User } from '@lib/entities/entities/user.entity';
import { Action } from '../types/action.enum';

@Injectable()
export class MenuInterceptor implements NestInterceptor {
  logger = new Logger(MenuInterceptor.name);
  constructor(
    private reflector: Reflector,
    @Inject('menu-factory') private menuFactory: IMenuFactory,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.isAuthenticated) {
      req.isAuthenticated();
    }
    const menus = [...this.menuFactory.factory()];
    const disableMenu =
      this.reflector.get<boolean>('disableMenu', context.getHandler()) ||
      this.reflector.get<boolean>('disableMenu', context.getClass());
    const isrender = Reflect.getMetadata(RENDER_METADATA, context.getHandler());
    if (isrender) {
      return next.handle().pipe(
        mergeMap(async res => {
          if (typeof res !== 'object') {
            res = { res };
            this.logger.debug('response wrap in object with key `res`');
          }
          if (disableMenu !== true) {
            res.menus = groupBy(menus, 'groupName');
          }
          return res;
        }),
      );
    } else {
      return next.handle();
    }
  }
}
