import { Mybe } from './mybe';

export interface ResponseToClient<T> {
  metaData: {
    isError: boolean;
    statusCode: number;
    message: string;
    paginate?: Mybe<MetaDataPagination>;
  };
  result: Mybe<T>;
}
interface MetaDataPagination {
  nextPage?: Mybe<string>;
  prevPage?: Mybe<string>;
  pageCount: number;
  total: number;
  itemCount: number;
}
