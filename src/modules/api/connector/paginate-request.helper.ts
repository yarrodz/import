import { AxiosRequestConfig } from 'axios';

import { IRequestPaginationOptions } from '../sub-schemas/request-sub-schemas/request-pagination-options.schema';
import { RequestPaginationPlacement } from '../enums/request-paginanation-placement';
import IPagination from '../../transfer/interfaces/pagination.interface';

class PaginateRequestHelper {
  public paginate(
    request: AxiosRequestConfig,
    paginationOptions: IRequestPaginationOptions,
    pagination: IPagination
  ) {
    if (!paginationOptions || !pagination) {
      return;
    }
    switch (paginationOptions.placement) {
      case RequestPaginationPlacement.QUERY_PARAMETERS:
        this.paginateQueryParams(request, paginationOptions, pagination);
        break;
      case RequestPaginationPlacement.BODY:
        this.paginateBody(request, paginationOptions, pagination);
        break;
      default: {
        throw new Error(
          'Error while paginating request. Unknown pagination placement.'
        );
      }
    }
  }

  private paginateQueryParams(
    request: AxiosRequestConfig,
    paginationOptions: IRequestPaginationOptions,
    pagination: IPagination
  ) {
    const { offsetParameter, limitParameter } = paginationOptions;
    const { offset, limit } = pagination;

    request.params = request.params || {};

    request.params[offsetParameter] = offset;
    request.params[limitParameter] = limit;
  }

  private paginateBody(
    request: AxiosRequestConfig,
    paginationOptions: IRequestPaginationOptions,
    pagination: IPagination
  ) {
    const { offsetParameter, limitParameter } = paginationOptions;
    const { offset, limit } = pagination;

    request.params = request.params || {};

    request.data[offsetParameter] = offset;
    request.data[limitParameter] = limit;
  }
}

export default PaginateRequestHelper;
