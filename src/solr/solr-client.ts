import { HttpService, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { SolrQuery } from './types/query';
import { SolrResponse } from './types/response';

export class SolrClient<U extends Record<string, any>> {
  constructor(
    private readonly collection: string,
    private readonly httpService: HttpService,
  ) {}
  async commit() {
    const result = this.httpService
      .post(`${this.collection}/update`, {}, { params: { commit: true } })
      .toPromise();
    return result;
  }
  async updateBatch(datas: U[], autoCommit = false) {
    const result = await this.httpService
      .post(`${this.collection}/update`, datas, {
        params: { commit: autoCommit },
      })
      .toPromise();
    return result;
  }
  async update(data: U, autoCommit = false) {
    return this.httpService
      .post(`${this.collection}/update/json/docs`, data, {
        params: { commit: autoCommit },
      })
      .toPromise();
  }
  async search<T extends SolrQuery<U>>(query?: Partial<T>) {
    return this.httpService
      .post<SolrResponse<U, T>>(`${this.collection}/query`, query)
      .toPromise();
  }
}
