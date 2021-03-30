import { ForumSource } from '@lib/entities/entities/forum-source.entity';

export type CallbackOpt = {
  maxItteratePage?: number;
  maxItterateTRPage?: number;
  startItteratePage?: number;
  startItterateTRPage?: number;
  description: string;
  page?: number;
} & ForumSource;
