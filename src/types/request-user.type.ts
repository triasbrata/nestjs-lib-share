import { User } from '@lib/entities/entities/user.entity';
import { Request } from 'express';
export type RequestWithUser = Request & {
  user: User;
};
