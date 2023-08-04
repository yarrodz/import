import OffsetPagination from './offset-pagination.interface';

export default interface OffsetPaginationFunction {
  (pagination: OffsetPagination, ...params: any[]): Promise<object[]>;
}
