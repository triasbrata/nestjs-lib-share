export enum CanScrape {
  POST = 'post',
  REPLY = 'reply',
  ALL = 'all',
}
export type DefaultScraper = Exclude<CanScrape, 'all'>;
