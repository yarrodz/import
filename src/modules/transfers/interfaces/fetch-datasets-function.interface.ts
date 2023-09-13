import { PaginationType } from '../enums/pagination-type.enum';
import { CursorPagination } from './cursor-pagination.interface';
import { OffsetPagination } from './offset-pagination.interface';

export interface FetchDatasetsFunctionResult {
  datasets: object[];
  cursor?: any;
}

export interface FetchDatasetsFunction {
  (pagination: OffsetPagination | CursorPagination):
    | FetchDatasetsFunctionResult
    | Promise<FetchDatasetsFunctionResult>;
}
