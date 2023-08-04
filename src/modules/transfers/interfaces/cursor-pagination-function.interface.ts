import CursorPagination from './cursor-pagination.interface';

interface CursorPaginationFunctionResult {
  cursor?: string;
  datasets: object[];
}

export default interface CursorPaginationFunction {
  (
    pagination: CursorPagination,
    ...params: any[]
  ): Promise<CursorPaginationFunctionResult>;
}
