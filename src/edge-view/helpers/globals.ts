import { genereateURL } from '@lib/share/helpers/fullstack-helper';
import { CleanerType } from '@lib/entities/schemas/pipe-rule';
import { zipObject, get as getObject } from 'lodash';
import { sentencecase, titlecase, spinalcase } from 'stringcase';
const listRules = zipObject(
  Object.values(CleanerType),
  Object.keys(CleanerType).map(it => `${titlecase(sentencecase(it))} Pipe`),
);
for (const keyListRule of Object.keys(listRules)) {
  if(keyListRule.match(/--page$/g) || keyListRule.match(/--url/g))
  {
    delete listRules[keyListRule];
  }
  
}
import * as Dot from 'dot-object';
import { cleanOrigin } from '@lib/share/helpers/clear-origin';
import * as moment from 'moment-timezone';
const dot = new Dot('.');
dot.keepArray = true;

export const GLOBAL_HELPER = {
  pipeTypes: (type?: string) => {
    if (type) {
      return listRules?.[type];
    }
    return listRules;
  },
  kebabCase: (str: string) => spinalcase(str),
  titlecase: (str: string) => titlecase(str),
  moment: (data: string, format: string, timezone?: string) =>
    timezone
      ? moment
          .unix(Number(data))
          .tz(timezone)
          .format(format)
      : moment.unix(Number(data)).format(format),
  accessObject: (obj: Record<string, any>, key: string, defaultVal?: any) =>
    getObject(obj, key, defaultVal),
  mustEndWith(str: string, endWith: string) {
    if (str.endsWith(endWith)) {
      return str;
    } else {
      return `${str}${endWith}`;
    }
  },
  cleanOrigin: (str: string) => {
    return cleanOrigin(str);
  },
  startWith: (str: string, start: string) => str.startsWith(start),
  generateURL: (strUrl: string, params: Record<string, string>) => {
    return genereateURL(strUrl, params);
  },
  pages(meta, baseUrl: string, query = {}) {
    const pages = [];
    if (!meta) {
      return pages;
    }
    const max =
      meta.currentPage + 2 < meta.totalPages
        ? meta.currentPage + 2
        : meta.totalPages - 1;
    const min = meta.currentPage - 2 > 2 ? meta.currentPage - 2 : 1;
    for (let index = min; index <= max; index++) {
      pages.push({
        div: false,
        page: index,
        active: index === meta.currentPage,
        url: this.generateURL(baseUrl, { ...query, page: index }),
      });
    }
    if (min > 2) {
      pages.unshift(
        {
          div: false,
          page: 1,
          active: false,
          url: this.generateURL(baseUrl, { ...query, page: 1 }),
        },
        { div: true },
      );
    }
    if (max < meta.totalPages) {
      if (max < meta.totalPages - 1) {
        pages.push({ div: true });
      }
      pages.push({
        div: false,
        page: meta.totalPages,
        active: false,
        url: this.generateURL(baseUrl, {
          ...query,
          page: meta.totalPages,
        }),
      });
    }
    if (meta.totalPages > meta.currentPage) {
      pages.push({
        div: false,
        page: 'Next',
        active: false,
        class: 'next',
        url: this.generateURL(baseUrl, {
          ...query,
          page: meta.currentPage + 1,
        }),
      });
    }
    if (1 < meta.currentPage) {
      pages.unshift({
        div: false,
        page: 'Prev',
        active: false,
        class: 'previous',
        url: this.generateURL(baseUrl, {
          ...query,
          page: meta.currentPage - 1,
        }),
      });
    }

    return pages;
  },
};
