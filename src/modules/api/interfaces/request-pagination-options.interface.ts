import { RequestPaginationPlacement } from '../enums/request-pagination-placement';

export default interface RequestPaginationOptions {
  placement: RequestPaginationPlacement;

  cursorParameterName?: string;
  cursorParameterPath?: string;

  offsetParameterName?: string;

  limitParameterName: string;
  limitValue: number;
}
