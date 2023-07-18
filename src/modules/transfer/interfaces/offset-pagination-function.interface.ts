import IOffsetPagination from './offset-pagination.interface';

export default interface IOffsetPaginationFunction {
  (pagination: IOffsetPagination, ...params: any[]): Promise<object[]>;
}
