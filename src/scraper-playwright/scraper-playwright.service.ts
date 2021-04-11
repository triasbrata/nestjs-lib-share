import { CleanerType } from '@lib/entities/schemas/pipe-rule';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { resolve } from 'path';
import { ElementHandle, Page } from 'playwright';
import { PlaywrightService } from '../playwright/playwright.service';
import { PatternContainerParser } from './pattern-container';
import { PatternContainer } from './types/patterns/pattern-container.type';
import { PatternField } from './types/patterns/pattern.type';

export interface evaluatePageOptions {
  url?: string;
  page?: Page;
  pattern: PatternContainer;
  autoClose?: boolean;
  waitAfterLoad?: number;
  scrollToView?: boolean;
}

@Injectable()
export class ScraperPlaywrightService {
  logger = new Logger(ScraperPlaywrightService.name);

  constructor(private readonly playwrightService: PlaywrightService) {
  }

  async evaluateWebsite<Out extends Record<string, any> = any>({ pattern, ...options }: evaluatePageOptions): Promise<[Out[], Page]> {
    let page: Page;
    if (options.url && !options.page) {
      page = await this.playwrightService.createPage();
      await page.goto(options.url);
      if (options.waitAfterLoad) {
        this.logger.debug(`wait for ${options.waitAfterLoad}s after success load ${options.url}`)
        await new Promise(res => setTimeout(res, options.waitAfterLoad * 1000));
      }
    } else {
      page = options.page;
    }
    const urlNow = page.url();
    const pContainer = this.makePattern(pattern.containerPattern, pattern.patternType)
    const nContainers = await page.$$(pContainer);
    if (nContainers.length < 1) {
      await page.screenshot({ path: resolve('outs/fails/test.png') })
      if (options.autoClose) {
        await page.close();
        page = null;
      }
      return [[], page];

    }
    const outs = [];
    for (const nodeCon of nContainers) {
      if(options.scrollToView){
        await nodeCon.scrollIntoViewIfNeeded();
      }
      const item: Record<string, string> = await nodeCon.evaluate((node, fields: PatternField[]) => 
        fields.reduce((item, field) =>
          field.patterns.reduce((item, pattern) => {
            if (!item[field.key]) {
              if (field.patternType === "css") {
                if (node.querySelector(pattern)) {
                  item[field.key] = node.querySelector(pattern);
                }
              } else {
                const vals = document.evaluate(pattern, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (vals.snapshotLength > 0 && vals.snapshotItem(0)) {
                  item[field.key] = vals.snapshotItem(0)
                }
              }
              if (field.returnType === "text" && item[field.key]) {
                if (field.patternType === "css") {
                  item[field.key] = item[field.key].textContent;
                } else {
                  item[field.key] = item[field.key].nodeValue;
                }
              }
            }
            return item;
          }, item)
          , {})
      , pattern.fields);
      outs.push(item);
    }
    this.logger.debug({ options })
    if (options.autoClose) {
      await page.close();
      page = null;
    }
    const data = this.pipeData<Out>(outs, pattern, urlNow);
    return [data, page];
  }

  private makePattern(pattern: string, patternType: "xpath" | "css") {
    if (patternType === "xpath" && !pattern.startsWith("xpath=")) {
      pattern = `xpath=${pattern}`
    }
    return pattern;
  }

  pipeData<Out = any>(outs: Out[], pattern: PatternContainer, url: string): Out[] {
    const patternClass = plainToClass(PatternContainerParser, pattern)
    return outs.map<Out>(item => {
      for (const { pipes, key } of patternClass.fields) {
        if (item?.[key]) {
          item[key] = pipes.reduce((res, pipe) => {
            pipe.baseUrl = url;
            if (typeof res === "number") {
              res = res.toString();
            }
            if (typeof pipe.exec === "function") {
              res = pipe.exec(res);
            }
            return res;
          }, item[key]);
        }
      }
      return item;
    })
  }
}