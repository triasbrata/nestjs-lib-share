import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { evaluateSubForum } from 'apps/scraper-service/src/helpers/evaluate-sub-forum';
import { evaluateThread } from 'apps/scraper-service/src/helpers/evaluate-thread';
import { classToPlain, plainToClass } from 'class-transformer';
import { Page } from 'puppeteer';
import { Browser } from '../browser/Browser';
import { ForumPostField } from '@lib/entities/entities/forum-pattern-post.entity';
import { ForumReplyField } from '@lib/entities/entities/forum-pattern-reply.entity';
import { PropOpenNewTab } from '../types/prop-open-new-tab.int';
import { ScrapingMode } from '../types/scraping-mode.enum';
import { ThreadPage } from '../types/thread-page.int';
import { SCRAPER_MODULE_OPTIONS } from './constants/scraper-webisite.constatn';
import { EngineType, UseEngine } from './types/engine.type';
import { CanScrape } from './types/can-scrape.type';
import { ScraperHtmlService } from '../scraper-html/scraper-html.service';
import { ScraperWebsiteModuleOptions } from './types/scraper-website-module-options.type';
import { FieldForum } from '@lib/entities/entities/field-forum';

@Injectable()
export class ScraperWebsiteService implements OnApplicationBootstrap {
  constructor(
    private readonly browser: Browser,
    private readonly scraperHTML: ScraperHtmlService,
    @Inject(SCRAPER_MODULE_OPTIONS)
    readonly moduleOptions: ScraperWebsiteModuleOptions,
  ) {}
  async onApplicationBootstrap() {
    await this._launchBrowser();
  }

  async evaluate(
    pattern: Partial<ForumPostField | ForumReplyField>[],
    url: string,
    engine?: UseEngine,
    mode: ScrapingMode = ScrapingMode.NORMAL,
  ) {
    const page = await this.browser.createNewPage({
      url: url,
      isRaw: mode === ScrapingMode.RAW,
    });
    if (this.moduleOptions.defaultScraper === CanScrape.POST) {
      return this.evaluatePost(
        pattern as Partial<ForumPostField>[],
        url,
        engine,
        page,
        mode,
      );
    } else if (this.moduleOptions.defaultScraper === CanScrape.REPLY) {
      return this.evaluateReply(
        pattern as Partial<ForumReplyField>[],
        url,
        engine,
        mode,
        page,
      );
    } else {
      throw new Error(
        'you cant register for all, and use evaluate. please use `evaluatePost` or `evaluateReply`',
      );
    }
  }
  async evaluateReply(
    pattern: Partial<ForumReplyField>[],
    url: string,
    engine: UseEngine,
    mode = ScrapingMode.NORMAL,
    page?: Page,
  ) {
    if (this.moduleOptions.canScrape == CanScrape.POST) {
      throw 'Wrong register scraper service, evaluate post but registered as ' +
        this.moduleOptions.canScrape;
    }
    if (this.checkEngine(engine)) {
      throw new Error(
        `Cant Evaluate post when with engine ${engine} when module only can use engine ${this.moduleOptions.engineType}`,
      );
    }
    const { reply, pages } =
      engine == 'js'
        ? await this.scrapingReplyUseBrowser(page, pattern, url, mode)
        : await this.scraperHTML.reply(pattern, url);

    return [this.pipeData(reply, pattern, url), this.pipeData(pages, this.extractPageRule(pattern), url)] as [
      Record<string, any>[],
      ThreadPage<string>[],
    ];
  }
  private extractPageRule(pattern: Partial<ForumReplyField>[]) {
    const pagePipeRule = pattern.find(it => it.meta?.isPage)?.pipe;
    const pageRule: Array<FieldForum> = [];
    if (pagePipeRule) {
      pageRule.push({
        key: 'page',
        pipe: pagePipeRule.filter(it => it.type.match(/--page$/g)?.length > 0)
      });
      pageRule.push({
        key: 'url',
        pipe: pagePipeRule.filter(it => it.type.match(/--url$/g)?.length > 0)
      });
    }
    return pageRule;
  }

  private checkEngine(engine: EngineType) {
    if(engine === this.moduleOptions.engineType){
      return false;
    }else{
      if (this.moduleOptions.engineType === EngineType.HYBRID) {
        return false;
      } 
      return true;
    }
  }

  async scrapingReplyUseBrowser(
    page: Page,
    pattern: Partial<ForumReplyField>[],
    url: string,
    mode: ScrapingMode,
  ): Promise<{ reply: Record<string, any>[]; pages: ThreadPage<string>[] }> {
    if (!page) {
      page = await this.openPage(url, mode);
    }
    const [reply, pages] = await page.evaluate(
      evaluateThread,
      classToPlain({
        pattern: pattern,
        originURL: url,
      }),
    );
    await page.close({ runBeforeUnload: true });
    return { reply, pages };
  }

  async evaluatePost(
    pattern: Partial<ForumPostField>[],
    url: string,
    engine: UseEngine,
    page?: Page,
    mode: ScrapingMode = ScrapingMode.NORMAL,
  ) {
    if (this.moduleOptions.canScrape === CanScrape.REPLY) {
      throw 'Wrong register scraper service, evaluate post but registered as ' +
        this.moduleOptions.canScrape;
    }
    if (this.checkEngine(engine)) {
      throw new Error(
        `Cant Evaluate post when with engine ${engine} when module only can use engine ${this.moduleOptions.engineType}`,
      );
    }
    const { threads, pages, resForum } =
      engine == 'html'
        ? await this.scraperHTML.post(url, pattern)
        : await this.scrapingUseBrowserPost(page, pattern, url, mode);
    const [firstReply] = this.pipeData([resForum], pattern, url);
    return [this.pipeData(threads, pattern, url), pages, firstReply] as [
      Record<string, string | number>[],
      Record<string, string | number>[],
      Record<string, string | number>,
    ];
  }
  async scrapingUseBrowserPost(
    page: Page,
    pattern: Partial<ForumPostField>[],
    url: string,
    mode: ScrapingMode,
  ): Promise<{
    threads: Record<string, string | number>[];
    pages: Record<string, any>[];
    resForum: Record<string, string | number>;
  }> {
    if (!page) {
      page = await this.browser.createNewPage({
        url: url,
        isRaw: mode === ScrapingMode.RAW,
      });
    }
    const [threads, pages, resForum] = await page.evaluate(
      evaluateSubForum,
      classToPlain({
        originUrl: url,
        pattern,
      }),
    );
    await page.close({ runBeforeUnload: true });
    return { threads, pages, resForum };
  }

  async openPage(
    url: string,
    mode: ScrapingMode,
    otherOpt: Partial<PropOpenNewTab> = {},
  ): Promise<Page> {
    return this.browser.createNewPage({
      url: url,
      isRaw: mode === ScrapingMode.RAW,
      ...otherOpt,
    });
  }

  pipeData(
    datas: Record<string, any>[],
    plainPatterns: Array<Partial<FieldForum>>,
    url: string,
  ) {
    const patterns = plainToClass(FieldForum, plainPatterns);
    return datas.map(data => {
      patterns.forEach((ptrn: ForumPostField | ForumReplyField) => {
        const dataVal = data[ptrn.key];
        if (dataVal && ptrn.pipe) {
          const resPipe = ptrn.pipe.reduce((pipeVal, pipe) => {
            pipe.baseUrl = url;
            if (typeof pipeVal === 'number') {
              pipeVal = pipeVal.toString();
            }
            if (typeof pipe.exec === 'function') {
              return pipe.exec(pipeVal);
            }
            return pipeVal;
          }, dataVal);
          data[ptrn.key] = resPipe;
        }
      });
      return data;
    });
  }

  async launchBrowser() {
    await this._launchBrowser();
    throw new Error('Cant Active browser when use html engine');
  }

  private async _launchBrowser() {
    if (
      [EngineType.HYBRID, EngineType.JS].includes(this.moduleOptions.engineType)
    ) {
      await this.browser.launchBrowser();
    }
  }
}
