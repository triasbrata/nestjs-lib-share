import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser, BrowserContextOptions, firefox, LaunchOptions } from 'playwright';
import { BrowserContext } from 'playwright';

@Injectable()
export class PlaywrightService implements OnApplicationBootstrap, OnModuleInit{
  private browserContext: BrowserContext;
  logger = new Logger(PlaywrightService.name);
  private browser: Browser;
  constructor(private readonly config: ConfigService){

  }
  async onModuleInit() {
    const optionLaunch:LaunchOptions = { headless: this.config.get('HEADLESS', 'true') === "true" };
    const proxyServer = this.config.get('PROXY_SERVER');
    const proxyUser = this.config.get('PROXY_USER');
    const proxyPass = this.config.get('PROXY_PASS');
    if(proxyServer){
      this.logger.debug("use proxy "+proxyServer);
      optionLaunch.proxy = {server:proxyServer}
    }
    if(proxyServer && proxyPass && proxyUser){
      optionLaunch.proxy.password = proxyPass;
      optionLaunch.proxy.username = proxyUser;
      this.logger.debug("setup proxy auth");
    }
    this.logger.debug('launching firefox')
    this.browser = await firefox.launch(optionLaunch);
    await this.createBrowserContex();
    this.logger.debug('firefox ready')
  }
  
  private async createBrowserContex(context?: BrowserContextOptions) {
    this.browserContext = await this.browser.newContext(context);
    this.browserContext.once("close", () => {
      this.browserContext = null;
    })
  }

  async onApplicationBootstrap() {
    const page = await this.createPage();
    this.logger.debug("test open browser");
    await page.goto('https://google.com').catch(() => process.exit());
    this.logger.debug('browser is ready');

  }
  
  async createPage() {
    if(this.browserContext){
      const page = await this.browserContext.newPage();
      return page
    }
    throw new Error("Cant create new page, coz browser context already closed");
   
  }
}
