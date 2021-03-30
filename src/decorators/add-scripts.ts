import { SetMetadata } from '@nestjs/common';

export const addScripts = (scripts: string[]) =>
  SetMetadata('scripts', scripts);
