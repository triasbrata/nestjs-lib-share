import { FlashMessage } from '../types/fullstack/flash-message';

interface FullstackConfig {
  baseUrl: string;
}
let config: Partial<FullstackConfig> = {};
export function setFullStackConfig(params: Partial<FullstackConfig>) {
  config = {
    ...config,
    ...params,
  };
}
export function genereateURL(url?: string, qParams?: Record<string, string>) {
  const urlObj = new URL(url || '', config.baseUrl);
  if (qParams) {
    Object.keys(qParams).forEach(key => {
      urlObj.searchParams.append(key, qParams[key]);
    });
  }
  return urlObj.toString();
}
export function redirect(
  goto: string,
  message?: FlashMessage | FlashMessage[],
) {
  const obj: Record<string, any> = {};
  if (message) {
    if (Array.isArray(message)) {
      obj._message = message;
    } else {
      obj._message = [message];
    }
  }
  obj._redirect = goto;
  return obj;
}
