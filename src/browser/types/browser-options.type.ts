import { ModuleMetadata } from '@nestjs/common';

export interface BrowserOptions {
  headless?: boolean;
  fastmode?: boolean;
}
export interface BrowserAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<BrowserOptions> | BrowserOptions;
  inject?: any[];
}
