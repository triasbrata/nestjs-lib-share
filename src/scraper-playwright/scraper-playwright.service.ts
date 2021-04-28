import { Keyword } from '@lib/entities/entities/keyword.entity';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { resolve } from 'path';
import { Page } from 'playwright';
import { cleanOrigin } from '../helpers/clear-origin';
import { PlaywrightService } from '../playwright/playwright.service';
import { PatternContainerParser } from './pattern-container';
import { PatternContainer } from './types/patterns/pattern-container.type';
import { PatternField } from './types/patterns/pattern.type';

export interface EvaluatePageOptions {

  url?: string;
  page?: Page;
  pattern: PatternContainer;
  autoClose?: boolean;
  waitAfterConnected?: number;
  scrollToView?: boolean;
  useURL?: boolean;
  keyword?:string;
  searchPattern?: string;
  pageNow:number;
  searchPatternType?: "css"|"xpath";
  waitContainer?:boolean;
}
export interface EvaluatePageLazyOptions extends EvaluatePageOptions{
  toPage: number,
  patternProduct: PatternContainer
}

@Injectable()
export class ScraperPlaywrightService {
  logger = new Logger(ScraperPlaywrightService.name);

  constructor(private readonly playwrightService: PlaywrightService) {
  }

  async evaluateWebsite<Out extends Record<string, any> = any>({ pattern, ...options }: EvaluatePageOptions): Promise<[Out[], Page]> {
    let page: Page;
    if(options.waitContainer === undefined){
      options.waitContainer= true;
    }
    try {
      if (options.url && !options.page) {
        page = await this.playwrightService.createPage();
        await page.goto(options.url, { waitUntil: "domcontentloaded" });
      } else {
        page = options.page;
      }
      if (options.waitAfterConnected && options.useURL === true) {
        this.logger.debug(`wait for ${options.waitAfterConnected}s after success load ${page.url()}`)
        await new Promise(res => setTimeout(res, options.waitAfterConnected * 1000));
      }
      if(options.useURL === false && options.pageNow === 1){
        const pattern = this.makePattern(options.searchPattern, options.searchPatternType);
        this.logger.log(`wait for selector`)
        await page.waitForSelector(pattern,{state:"visible"});
        this.logger.log(`type keyword : ${options.keyword}`)
        await page.type(pattern, options.keyword,{delay:100});
        this.logger.log(`press enter`)
        await page.$(pattern).then(el => el.press("Enter"))
        this.logger.log(`wait for page redirect`)
        await page.waitForNavigation({waitUntil:"networkidle"});
        this.logger.log(`redirected page`)
        if (options.waitAfterConnected) {
          this.logger.debug(`wait for ${options.waitAfterConnected}s after success load ${page.url()}`)
          await new Promise(res => setTimeout(res, options.waitAfterConnected * 1000));
        }
      }
      const urlNow = page.url();
      const originUrl = cleanOrigin(new URL(urlNow).origin);
      const pContainer = this.makePattern(pattern.containerPattern, pattern.patternType)
      if(options.waitContainer){
        this.logger.log(`wait for selector container ${pContainer}`)
        await page.waitForSelector(pContainer);
      }
      if ((pattern.fields?.length || 0) < 1) {
        return [[], page];
      }
      const nContainers = await page.$$(pContainer);
      if (nContainers.length < 1) {
        await page.screenshot({ path: resolve(`outs/fails/${originUrl}.png`) })
        if (options.autoClose) {
          await page.close();
          page = null;
        }
        return [[], page];

      }
      const outs = [];
      for (const nodeCon of nContainers) {
        
       try {
         await nodeCon.waitForElementState("stable")
         const elIsHidden = await nodeCon.isHidden();
         this.logger.log(`scroll to view : ${options.scrollToView && elIsHidden}`)
         if (options.scrollToView && elIsHidden) {
           await nodeCon.evaluate(it => it.scrollIntoView());
         }
         const item: Record<string, string> = await nodeCon.evaluate((node, fields: Array<PatternField & { meta: any }>) =>
           fields.reduce((item, field) =>{

             const isMultiple = field.meta.multiple === 'true' || false;
             return field.patterns.reduce((item, pattern) => {
               if (!item[field.key]) {
                 if (field.patternType === "css") {
                   const ncss = node.querySelectorAll(pattern);
                   if (ncss.length > 0) {
                     item[field.key] = isMultiple ?ncss: ncss[0];
                   }
                 } else {
                   const vals = document.evaluate(pattern, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                   if (vals.snapshotLength > 0) {
                     if(isMultiple){
                       item[field.key] = [];
                       for (let i = 0; i < vals.snapshotLength; i++) {
                         item[field.key].push(vals.snapshotItem(i));
                       }
                     }else{
                       item[field.key] = vals.snapshotItem(0)
                     }
                   }
                 }
                 if (field.returnType === "text" && item[field.key]) {
                   if (field.patternType === "css") {
                     item[field.key] = isMultiple ? item[field.key].map(nn =>nn.textContent).join('') : item[field.key].textContent;
                   } else {
                     item[field.key] = isMultiple ? item[field.key].map(nn => nn.nodeValue).join('') :item[field.key].nodeValue;
                   }
                 }
               }
               return item;
             }, item)
           }
             , {})
           , pattern.fields);
         outs.push(item);
       } catch (error) {
         console.error(error);
         break;
       }
      }
      if (options.autoClose) {
        await page.close();
        page = null;
      }
      const data = this.pipeData<Out>(outs, pattern, urlNow);
      return [data, page];
    } catch (error) {
      if (page && !page.isClosed()) {
        const pathFile = resolve(`outs/fails/${cleanOrigin(page.url())}.png`);
        await page.screenshot({ path: pathFile, type:"png" });
        this.logger.debug(pathFile);
      }
      throw error;
    }
  }

  async evaluateWebsiteWithLazyPage(options:EvaluatePageLazyOptions){
    let products: Record<string, any>[] = [];
    //load page;
    const [, page] = await this.evaluateWebsite({
      url: options.url,
      pattern: options.pattern,
      waitAfterConnected: options.waitAfterConnected,
      useURL:options.useURL,
      searchPatternType: options.searchPatternType,
      searchPattern:options.searchPattern,
      scrollToView: true,
      pageNow:options.pageNow,
    });
    //
    let x = options.pageNow;
    do {
      try {
        const elLoadMore = await page.$(this.makePattern(options.pattern.containerPattern, options.pattern.patternType));
        if (elLoadMore) {
          x++;
          await elLoadMore.scrollIntoViewIfNeeded();
          await elLoadMore.click();
          try {
            await page.waitForSelector(this.makePattern(options.pattern.containerPattern, options.pattern.patternType));
          } catch (error) {
            break;
          }

        } else {
          break;
        }
      } catch (error) {
        console.error(error);
        break;
      }
    } while (x < options.toPage);
    await page.evaluate(() => window.scrollTo(0, 0));
    // const sh = await page.evaluate(() => document.body.scrollHeight);
    // do {
    //   await page.evaluate(() => window.scrollBy(0, Math.floor(Math.random() * 100)));
    //   await new Promise(res => setTimeout(res, 100));
    //   const next = await page.$(this.scraper.makePattern(dto.page.containerPattern, dto.page.patternType))
    //   if(await next.isVisible()){
    //     break;
    //   }
    //   const scrollY = await page.evaluate(()=> window.scrollY);
    //   if(scrollY>=sh){
    //     break;
    //   }
    // } while (true);
    await page.waitForSelector(this.makePattern(options.patternProduct.containerPattern, options.patternProduct.patternType), { state: 'attached' });
    [products] = await this.evaluateWebsite({
      page,
      pattern: options.patternProduct,
      waitAfterConnected: options.waitAfterConnected,
      autoClose: options.autoClose,
      scrollToView: true,
      pageNow:options.pageNow,
    });
    return products;
  }

  async evaluateWebsiteWithLazyReplace(options: EvaluatePageLazyOptions){
    let products: Record<string, any>[] = [];
    let page: Page;
    this.logger.log('try to load page');
    [products, page] = await this.evaluateWebsite({
      url: options.url,
      pattern: options.patternProduct,
      waitAfterConnected: options.waitAfterConnected,
      scrollToView: true,
      useURL: options.useURL,
      searchPatternType: options.searchPatternType,
      searchPattern: options.searchPattern,
      pageNow: options.pageNow,
    });
    this.logger.log('scraping product first page ');
    let x = options.pageNow;
    do {
      if (page && !page.isClosed()) {
        const pageSelector = this.makePattern(options.pattern.containerPattern, options.pattern.patternType);
        this.logger.log(`wait element next (${pageSelector})`)
        const elLoadMore = await page.$(pageSelector);
        if (elLoadMore) {
          x++;
          this.logger.log('click element '+pageSelector);
          await elLoadMore.click();
        } else {
          break;
        }
        try {
          this.logger.log('wait network iddle');
          await page.waitForLoadState("networkidle");
          this.logger.log('wait for first product element');
          await page.waitForSelector(this.makePattern(options.patternProduct.containerPattern, options.patternProduct.patternType), { state: 'attached' });
          let nextProducts: Record<string, any>[] = [];
          this.logger.log('scraping product on page '+ x);
          [nextProducts, page] = await this.evaluateWebsite({
            page,
            pattern: options.patternProduct,
            waitAfterConnected: options.waitAfterConnected,
            scrollToView: true,
            pageNow: options.pageNow,
          });
          products = [...products, ...nextProducts];
        } catch (error) {
          console.error(error)
          break;
        }
      
      } else {
        break;
      }
    } while (x < options.toPage);
    if (page && !page.isClosed() && options.autoClose) {
      await page.close();
    }
    return products;
  }

  makePattern(pattern: string, patternType: "xpath" | "css") {
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
