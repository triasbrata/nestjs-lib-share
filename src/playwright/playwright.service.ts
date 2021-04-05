import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser, firefox, LaunchOptions } from 'playwright';

@Injectable()
export class PlaywrightService implements OnApplicationBootstrap, OnModuleInit{
  browser: Browser;
  logger = new Logger(PlaywrightService.name);
  constructor(private readonly config: ConfigService){

  }
  async onModuleInit() {
    const optionLaunch:LaunchOptions = { headless: this.config.get('HEADLESS', 'true') === "true" };
    const proxyServer = this.config.get('PROXY_SERVER');
    const proxyUser = this.config.get('PROXY_USER');
    const proxyPass = this.config.get('PROXY_PASS');
    if(proxyServer){
      optionLaunch.proxy = {server:proxyServer}
    }
    if(proxyServer && proxyPass && proxyUser){
      optionLaunch.proxy.password = proxyPass;
      optionLaunch.proxy.username = proxyUser;
    }
    this.logger.debug('launching firefox')
    this.browser = await firefox.launch(optionLaunch);
    this.logger.debug('firefox ready')
  }
  
  async onApplicationBootstrap() {
    const page = await this.createPage();
    this.logger.debug("test open browser");
    await page.goto('https://google.com');
    this.logger.debug('browser is ready');

  }
  
  async createPage() {
    const page = await this.browser.newPage();
    return page
  }
}
