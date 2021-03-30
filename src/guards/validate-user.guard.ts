import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EdgeViewService } from '../edge-view/edge-view.service';

@Injectable()
export class ValidateUserGuard implements CanActivate {
  constructor(private readonly viewService: EdgeViewService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuth = request.isAuthenticated();
    return isAuth;
  }
}
