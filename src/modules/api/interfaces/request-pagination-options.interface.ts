import { RequestPaginationPlacement } from '../enums/request-pagination-placement';

export interface RequestPaginationOptions {
  placement: RequestPaginationPlacement;

  cursorKey?: string;
  cursorPath?: string;

  offsetKey?: string;

  limitKey: string;
  limitValue: number;
}
