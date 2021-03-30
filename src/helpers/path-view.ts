import { existsSync } from 'fs';
import { join } from 'path';

export function pathView(dirname: string) {
  const distViewPath = join(dirname, '..', '..', '..', 'views');
  const srcViewPath = distViewPath.replace('/dist/', '/');
  const appViewsOpt = [srcViewPath, distViewPath];
  const distLibViewPath = join(
    dirname,
    '..',
    '..',
    '..',
    'libs',
    'share',
    'views',
  );
  const scrLibViewPath = distLibViewPath.replace(
    new RegExp('/dist/apps/(.*)/libs', 'g'),
    '/libs',
  );
  const libsViewOpt = [scrLibViewPath, distLibViewPath];
  const checkDirOpt = ([dirOpt, ...dirOpts]: string[], forDir: string) => {
    if (dirOpt.length > 0 && existsSync(dirOpt)) {
      return dirOpt;
    }
    if (dirOpts.length > 0) {
      return checkDirOpt(dirOpts, forDir);
    }
    throw new Error(`Out of option view ${forDir}`);
  };
  return [checkDirOpt(appViewsOpt, 'app'), checkDirOpt(libsViewOpt, 'libs')];
}
//dist/apps/pattern-gui/apps/pattern-gui/views
//dist/apps/pattern-gui/views
