import ICursorPagination from './cursor-pagination.interface';

export interface ICursorPaginationFunctionResponse {
  cursor?: string;
  datasets?: object[];
}

export default interface ICursorPaginationFunction {
  (
    pagination: ICursorPagination,
    ...params: any[]
  ): Promise<ICursorPaginationFunctionResponse>;
}
