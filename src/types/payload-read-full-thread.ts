import { Type } from 'class-transformer';
import { Page } from 'puppeteer';
import { ForumReplyField } from '@lib/entities/entities/forum-pattern-reply.entity';
import { ThreadEntity } from '@lib/entities/entities/thread.entity';
import { UseEngine } from '../scraper-website/types/engine.type';
import { CanRecovery } from './can-recovery';

export class PayloadReadFullThread implements CanRecovery {
         engine: UseEngine;
         numRetry: number;
         jobID: string;
         endPoint: string;
         origin: string;
         @Type(() => ForumReplyField)
         pattern: ForumReplyField[];
         maxItteratePage: number; // max itteration
         pageNow: number;
         numItterate: number; // nummber itteration now
         mediaId: number;
         timecheck:number; // last update pattern
         @Type(() => ThreadEntity)
         thread: Partial<ThreadEntity>;
         timeout: number;
         historyId?: number;
       }
