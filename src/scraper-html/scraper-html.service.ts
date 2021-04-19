import { HttpService, Injectable } from '@nestjs/common';
import { ForumReplyField } from '@lib/entities/entities/forum-pattern-reply.entity';
import { ThreadPage } from '../types/thread-page.int';
import * as parse from 'parse-key-value';
import * as libxmljs from 'libxmljs2';
import * as useragent from 'random-useragent';
import {
  ForumPostField,
  ScopeScrapingEx,
} from '@lib/entities/entities/forum-pattern-post.entity';
import { isEmpty } from 'class-validator';
import * as decodeHTML from 'decode-html';
@Injectable()
export class ScraperHtmlService {
  constructor(private readonly httpService: HttpService) {}
  getValue(n: libxmljs.Node) {
    if (isEmpty(n)) {
      return null;
    }
    let val;
    if(n?.type && n.type() === 'attribute'){
      
      const _temp = Object.values<string>(parse(n.toString()))[0];
      if(typeof _temp === "string"){
        val = _temp?.trim(); 
      }else{
        return _temp;
      }
      
    }else{
      val = n.toString()?.trim();
    }
    if(val){
      val = val
        .replace(/  /g, ' ')
        .replace(/\t/g, '')
        .replace(/\r/g, '')
        .replace(/\n/g, '');
      return decodeHTML(val);
    }
    return val;
    
  }
  async post(
    baseURL: string,
    pattern: Partial<ForumPostField>[],
  ): Promise<{
    threads: Record<string, string | number>[];
    resForum: Record<string, string | number>;
    pages: Record<string, any>[];
  }> {
    const originUrl = new URL(baseURL)?.origin;
    const containerPattern = pattern.find(
      p => p.meta?.isThreadNode && !p.meta?.isPaginateNode,
    );
    const pagePattern = pattern.find(
      p => !p.meta?.isThreadNode && p.meta?.isPaginateNode,
    );
    const fieldPattern = pattern.filter(
      p =>
        !p.meta?.isThreadNode &&
        !p.meta?.isPaginateNode &&
        p.scope == ScopeScrapingEx.THREAD,
    );
    const indexFieldPattern = pattern.filter(
      p =>
        !p.meta?.isThreadNode &&
        !p.meta?.isPaginateNode &&
        p.scope == ScopeScrapingEx.INDEX_PAGE,
    );
    const { data } = await this.getHTML(baseURL);
    if (!containerPattern || !data) {
      return { threads: [], pages: [], resForum: {} };
    }
    const reduceObject = function(
      item: Record<string, any>,
      ip: Partial<ForumPostField>,
    ): Record<string, string | number> {
      const xpaths = [ip.pattern, ...(ip.meta?.alterPattern || [])];
      const val = xpaths.reduce((pval, xpath) => {
        if (pval === null) {
          if(ip.meta?.multiline){
            pval = this.node.find(xpath).map(rnode => this.getValue(rnode)).join(' ');
          }else{
            const rnode = this.node.get(xpath);
            pval = !isEmpty(this.getValue(rnode)) ? this.getValue(rnode) : null;
          }
        }
        return pval;
      }, null);
      return { ...item, [ip.key]: val };
    };
    const dom = libxmljs.parseHtml(data);
    const indexRes = indexFieldPattern.reduce(
      reduceObject.bind({ node: dom, getValue: this.getValue }),
      {},
    ) as Record<string, string | number>;
    const threads =
      dom
        .find(containerPattern.pattern)
        .map((cnode: libxmljs.Document & libxmljs.Node) =>
          fieldPattern.reduce<Record<string, string | number>>(
            reduceObject.bind({ node: cnode, getValue: this.getValue }),
            indexRes,
          ),
        ) || [];
    const urlTextPattern = pagePattern?.meta?.pagePatterns || {
      url: './@href',
      text: './text()[normalize-space()]',
    };
    const pages = !pagePattern
      ? []
      : dom
          .find(pagePattern.pattern)
          .map((pnode: libxmljs.Document & libxmljs.Node) =>
            Object.keys(urlTextPattern).reduce((pageItem, key) => {
              const nvalue = pnode.get(urlTextPattern[key]);
              const val =
                key === 'url'
                  ? new URL(this.getValue(nvalue), originUrl).toString()
                  : this.getValue(nvalue);
              return {
                ...pageItem,
                [key]: val || null,
              };
            }, {}),
          );
    const resultOut = { pages, threads, resForum: indexRes };
    return resultOut;
  }
  async getHTML(url: string): Promise<{ data: any }> {
    const userAgent = useragent.getRandom(function (it) {
      return (
        it.folder.startsWith('/Browsers - ') &&
        it.browserName === 'Chrome' &&
        Number(it.browserMajor) > 70
      );
    });
    const resHtml = await this.httpService
      .get(url, {
        headers: {
          'User-Agent': userAgent,
        },
      })
      .toPromise()
      .catch((e) => {console.error(e.message, url)});
    return resHtml ? resHtml : { data: null };
  }

  async reply(
    pattern: Partial<ForumReplyField>[],
    originUrl: string,
  ): Promise<{ reply: Record<string, any>[]; pages: ThreadPage<string>[] }> {
    const basePathUrl = new URL(originUrl)?.origin
    //code
    const containerPattern = pattern.find(
      p => p.meta?.isContainer && !p.meta?.isPage,
    );
    const pagePattern = pattern.find(
      p => !p.meta?.isContainer && p.meta?.isPage,
    );
    const fieldPattern = pattern.filter(
      p => !p.meta?.isContainer && !p.meta?.isPage,
    );
    const { data } = await this.getHTML(originUrl);
    if (!containerPattern || !data) {
      return { reply: [], pages: [] };
    }
    const dom = this.createDOM(data);
    const reply = dom
      .find(containerPattern.pattern)
      .map((cnode: libxmljs.Node & libxmljs.Document) =>
        fieldPattern.reduce((out, pfield) => {
          const xpaths = [pfield.pattern, ...(pfield.meta?.alterPattern || [])];
          const val = xpaths.reduce((pv, xpath) => {
            if (pv == null) {
              const temp = pfield?.meta?.multiple
                ? cnode.find(xpath)
                : cnode.get(xpath);
              if (Array.isArray(temp)) {
                pv = temp
                  .map(this.getValue)
                  .join(' ')
                  .replace(/  /gm, '');
              } else {
                pv = this.getValue(temp);
              }
            }
            return pv;
          }, null);
          return { ...out, [pfield.key]: val };
        }, {}),
      );
    let pages = [];
    const pageDom = dom
      .find(pagePattern?.pattern);
    if(pageDom && pageDom?.length > 0){
      pages = pageDom.map((cnode: libxmljs.Node & libxmljs.Document) => {
        const urlPath = this.getValue(cnode.get('./@href'));
        if (urlPath) {
          const url = new URL(urlPath, basePathUrl).toString();
          const pageTitle = this.getValue(
            cnode.get('./text()[normalize-space()]'),
          );
          return {
            url: url,
            page: pageTitle,
          };
        }
      });
    }
    return { reply, pages };
  }

  createDOM(data: any) {
    return libxmljs.parseHtml(data);
  }
}
