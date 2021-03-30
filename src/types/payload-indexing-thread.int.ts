import { Type } from 'class-transformer';
import { ForumPostField } from '@lib/entities/entities/forum-pattern-post.entity';
import { ForumReplyField } from '@lib/entities/entities/forum-pattern-reply.entity';
import { UseEngine } from '../scraper-website/types/engine.type';
import { CanRecovery } from './can-recovery';
import { ScheduledPayload } from './scheduled-payload';

export class PayloadIndexingThread implements CanRecovery, ScheduledPayload {
         runTimeStart?: number;
         runTimeStop?: number;
         numRetry: number;
         description: string;
         jobID: string;
         endPoint: string;
         interval: number;
         @Type(() => ForumReplyField)
         patternReply: ForumReplyField[];
         @Type(() => ForumPostField)
         patternPost: ForumPostField[];
         subForumId: number;
         numItterate: number; //number of itteration sub forum
         maxItteratePage: number; // max itteration sub forum
         maxItterateTRPage?: number; //number of itteration thread reply
         page: number;
         origin: string;
         mediaId: number;
         timecheck:number;
         langCode: string;
         countryCode: string;
         timeout: number;
         engine: UseEngine;
       }
