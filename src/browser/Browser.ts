import * as puppeteer from 'puppeteer';
import { join, resolve } from 'path';
import { getRandom as randomUserAgent } from 'random-useragent';
import { PropOpenNewTab } from '../types/prop-open-new-tab.int';
import {
  HttpService,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LaunchOptions, Browser as ChromeBrowser } from 'puppeteer';

import { JsonDB } from 'node-json-db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { cleanOrigin } from '../helpers/clear-origin';
import * as Redis from 'ioredis';
import * as moment from 'moment';
import { BROWSER_MODULE_OPTIONS } from './const/browser.constanta';
import { BrowserOptions } from './types/browser-options.type';
@Injectable()
export class Browser {
  browser: ChromeBrowser;
  redis: Redis.Redis;
  get browserInstance() {
    return this.browser;
  }
  state: 'disconnected' | 'connected' | 'disconnect' = 'disconnected';
  private readonly logger = new Logger(Browser.name);
  scDB: JsonDB;
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @Inject(BROWSER_MODULE_OPTIONS)
    private readonly browserOptions: BrowserOptions,
  ) {}

  async launchBrowser() {
    if (this.state === 'connected') {
      return this;
    }
    if (
      this.browser &&
      this.browser.process() !== null &&
      !this.browser.process()?.killed
    ) {
      this.logger.debug(
        'force close previous browser With PID: ' +
          this.browser?.process()?.pid,
      );
      this.browser.process()?.kill('SIGINT');
      this.logger.debug(
        'wait 10s and try relaunch' + this.browser?.process()?.pid,
      );
      this.logger.debug(
        `browser is closed : ${this.browser?.process()?.killed ? 'yes' : 'no'}`,
      );
      await new Promise(res => setTimeout(res, 1000 * 10));
      return this.launchBrowser();
    }
    const port = 8000 + Number((process.env.pm_id || 0));
    const args = [
      '--window-size=1280x720',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--enable-features=NetworkService',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-features=IsolateOrigins,site-per-process',
      '--single-process',
      '--no-zygote',
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      `--remote-debugging-port=${port}`,
      '--disable-web-security'
    ];
    const proxyServer = this.config.get('PROXY_SERVER');
    if (proxyServer){
      args.push('--proxy-server='+proxyServer)
    }
    const options = {
      defaultViewport: null,
      ignoreHTTPSErrors: true,
      args: args,
      headless: this.browserOptions.headless,
    };
    this.browser = await puppeteer.launch(options);
    this.state = 'connected';
    const page = await this.createNewPage({
      url: 'https://google.com',
      isRaw: false,
    });
    this.browser.on('disconnected', async () => {
      // this.redis.decr('instance');
      this.state = 'disconnected';
    });
    this.logger.debug('Browser create new instance');
    return this;
  }
  @Cron(CronExpression.EVERY_3_HOURS)
  async doRestartBrowser(retry = 1) {
    if (this.state === 'connected') {
      try {
        this.state = 'disconnect';
        const pages = await this.browser.pages();
        if (pages.length > 0 && retry <= 3) {
          this.logger.debug(
            `wait ${pages.length} page closed, ${retry} try close browser, retry again in 40s`,
          );
          await new Promise(res => setTimeout(res, 1000 * 40));
          return this.doRestartBrowser(retry + 1);
        } else if (pages.length > 0 && retry <= 3) {
          this.logger.debug(`force close all tabs`);
        }
        await this.browser.close();
        this.logger.debug('==== Browser restart ====');
        await this.launchBrowser();
      } catch (error) {
        console.error(error);
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async doDeleteZombiePage() {
    if (this.state === 'connected') {
      try {
        const now = moment();
        const rawPages = await this.browser.pages();
        const pages = rawPages.filter(p => p.isClosed());
        if (pages.length > 4) {
          this.logger.debug('ratakan para zombie 🏹');
          this.logger.debug(`ketemu ${pages.length - 4} 🧟‍♂️`);
          const deletePages = pages.slice(0, pages.length - 4);
          for (const page of deletePages) {
            this.logger.debug(`🧟‍♂️ ${page.url()}`);
            await page.close({
              runBeforeUnload: true,
            });
          }
          this.logger.debug(
            `hunt selesai 🏹 selama ${moment().diff(now, 'second')} s`,
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  async createNewPage(opt: PropOpenNewTab) {
    if (opt.url) {
      this.logger.debug('open new tab ' + opt.url);
    } else {
      this.logger.debug('open new tab for response curl');
    }

    const page = await this.createPage();
    const origin = opt.url ? cleanOrigin(new URL(opt.url).origin) : null;
    const isKaskus = origin === 'kaskus.co.id';
    const interceptRequest =
      this.browserOptions.fastmode || opt.isRaw || isKaskus;
    if (interceptRequest) {
      this.doInterceptRequest(page);
    }
    const handleFailLoad = async (e: Error, page: puppeteer.Page) => {
      if (this.config.get('SC_ON_FAIL', 'false') === 'false') {
        await this.screenshootPage(page);
      }
      await page.close({ runBeforeUnload: true });
      throw new Error('Page closed because ' + e.message);
    };
    if (page && !page.isClosed()) {
      if (opt.isRaw !== true) {
        try {
          const nTimeout =
            opt.timeout || this.config.get('BROWSER_TIMEOUT', 40);
          const timeout = nTimeout * 1000;
          await page.goto(opt.url, {
            timeout: timeout,
            waitUntil: 'domcontentloaded',
          });
        } catch (e) {
          await handleFailLoad(e, page);
        }
      } else {
        try {
          const res = await this.httpService.get(opt.url).toPromise();
          await page.setContent(res.data);
        } catch (e) {
          await handleFailLoad(e, page);
        }
      }
      await page.addScriptTag({ path: resolve('helperPage.js') });
      if (interceptRequest) {
        page.removeAllListeners('request');
      }
      return page;
    } else {
      throw new Error('Page is closed');
    }
  }
  private doInterceptRequest(page: puppeteer.Page) {
    page.setRequestInterception(true);
    page.removeAllListeners('request');
    page.on('request', request => {
      const allowedReqType = [
        'document',
        'stylesheet',
        'image',
        'media',
        'font',
        'script',
        'xhr',
      ];
      if (allowedReqType.includes(request.resourceType())) {
        request.continue();
      } else {
        request.abort('connectionfailed');
      }
    });
  }

  async screenshootPage(page: puppeteer.Page) {
    const url = page.url();
    const filename =
      url.replace(RegExp('(:|\\/|\\.|-)', 'g'), '-').replace(/-+/g, '-') +
      '.png';
    const filepath = join('outs', filename);
    this.logger.debug(filepath);
    const path = resolve(filepath);
    this.logger.debug(`screenshoot ${path}`);
    await page.screenshot({ path: path });
  }
  async createPage() : Promise<puppeteer.Page> {
    if (this.state != 'connected') {
      await new Promise(res => setTimeout(res, 1000 * 40));
      return this.createPage();
    }
    let page: puppeteer.Page;
    [page] = await this.browser.pages();
    if (!page || (page && page.url() !== 'about:blank')) {
      page = await this.browser.newPage();
    }
    const userAuth = this.config.get('PROXY_USER');
    const passAuth = this.config.get('PROXY_PASS');
    if(userAuth && passAuth){
      await page.authenticate({username: userAuth, password: passAuth});
    }
    return page;
  }

  userAgent(mobileMode = false): string {
    const userAgent = randomUserAgent(function(it) {
      return (
        it.folder.startsWith('/Browsers - ') &&
        it.browserName === 'Chrome' &&
        Number(it.browserMajor) > 70
      );
    });
    return userAgent;
  }
}
