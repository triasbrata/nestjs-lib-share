import { existsSync } from 'fs';
import { join } from 'path';

type RenderConfig = {
  basePath: string[];
  renderEngine: (...args: any) => any;
};

const renderConfig: Partial<RenderConfig> = {};
export const setRenderConfig = (data: RenderConfig) => {
  Object.keys(data).forEach(key => {
    if (data[key]) {
      renderConfig[key] = data[key];
    }
  });
};
function isViewPathExists(
  viewPath: string,
  [basePath, ...basePaths]: string[],
) {
  if (basePath.length > 0) {
    const path = join(basePath, viewPath);
    const testPath = path.endsWith('.eta') ? path : `${path}.eta`;
    if (existsSync(testPath)) {
      return path;
    }
    if (basePaths.length > 0) {
      return isViewPathExists(viewPath, basePaths);
    }
  }
  throw new Error(`Path ${viewPath} not found and out of options`);
}
export const renderView = async (
  viewPath: string,
  data?: Record<string, any>,
) => {
  return renderConfig.renderEngine(
    isViewPathExists(viewPath, renderConfig.basePath),
    data || {},
  );
};
