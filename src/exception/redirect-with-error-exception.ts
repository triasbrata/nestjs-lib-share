import { HttpException } from '@nestjs/common';

export class RedirectWithErrorException extends HttpException {
  constructor(
    readonly redirect: string,
    response?: string | Record<string, string>,
    status?: number,
  ) {
    super(response, status);
  }
}
