import { OffsetPagination } from './offset-pagination.interface';

export interface OffsetPaginationFunction {
  (pagination: OffsetPagination, ...params: any[]): Promise<object[]>;
}
