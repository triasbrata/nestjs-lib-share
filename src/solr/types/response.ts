export interface SolrResponse<U, T> {
  responseHeader: SolrResponseHeader<T>;
  response: SolrResponseDocs<U>;
}
interface SolrResponseHeader<T> {
  zkConnected: boolean;
  status: number;
  QTime: number;
  params: T;
}
interface SolrResponseDocs<T> {
  numFound: number;
  start: number;
  maxScore: number;
  docs: T[];
}
