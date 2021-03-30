import { Request } from 'express';
import session from 'express-session';
export type RequestWithFlash = Request & {
  flash<T extends any>(key: string, value?: T): Promise<void>;
  session: session.Session &
    Partial<session.SessionData> & { flashMessage: Record<string, any> };
};
