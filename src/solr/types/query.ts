export interface SolrQuery<U> {
  query: U | string;
  filter: string;
  offset: number;
  limit: number;
  fields: Array<keyof U>;
  sort: string;
  facet: string;
}
