import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser, firefox } from 'playwright';

@Injectable()
export class PlaywrightService implements OnApplicationBootstrap, OnModuleInit{
  browser: Browser;
  logger = new Logger(PlaywrightService.name);
  constructor(private readonly config: ConfigService){

  }
  async onModuleInit() {
    this.browser = await firefox.launch({ headless: this.config.get('HEADLESS', 'true') === "true" });
  }
  
  async onApplicationBootstrap() {
    const page = await this.createPage();
    this.logger.debug("test open browser");
    await page.goto('https://google.com');

  }
  
  async createPage() {
    const page = await this.browser.newPage();
    return page
  }
}
