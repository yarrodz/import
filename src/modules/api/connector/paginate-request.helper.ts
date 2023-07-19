import { AxiosRequestConfig } from 'axios';

import { IRequestPaginationOptions } from '../sub-schemas/api-sub-schemas/request-pagination-options.schema';
import { RequestPaginationPlacement } from '../enums/request-paginanation-placement';
import IOffsetPagination from '../../transfer/interfaces/offset-pagination.interface';
import ICursorPagination from '../../transfer/interfaces/cursor-pagination.interface';
import { TransferType } from '../../transfer/enums/transfer-type.enum';

class PaginateRequestHelper {
  public paginate(
    request: AxiosRequestConfig,
    paginationType: TransferType,
    paginationOptions: IRequestPaginationOptions,
    pagination: IOffsetPagination | ICursorPagination
  ) {
    if (!paginationOptions || !pagination) {
      return;
    }
    const { placement } = paginationOptions;

    switch (placement) {
      case RequestPaginationPlacement.QUERY_PARAMETERS:
        this.paginateQueryParams(
          request,
          paginationType,
          paginationOptions,
          pagination
        );
        break;
      case RequestPaginationPlacement.BODY:
        this.paginateBody(
          request,
          paginationType,
          paginationOptions,
          pagination
        );
        break;
      default: {
        throw new Error(
          `Error while paginating request. Unknown pagination placement: '${placement}'.`
        );
      }
    }
  }

  private paginateQueryParams(
    request: AxiosRequestConfig,
    paginationType: TransferType,
    paginationOptions: IRequestPaginationOptions,
    pagination: IOffsetPagination | ICursorPagination
  ) {
    switch (paginationType) {
      case TransferType.OFFSET_PAGINATION: {
        const { offsetParameter, limitParameter } = paginationOptions;
        const { offset, limit } = pagination as IOffsetPagination;

        request.params = request.params || {};

        request.params[offsetParameter] = offset;
        request.params[limitParameter] = limit;
        break;
      }
      case TransferType.CURSOR_PAGINATION: {
        const { cursorParameter, limitParameter } = paginationOptions;
        const { cursor, limit } = pagination as ICursorPagination;

        request.params = request.params || {};

        request.params[cursorParameter] = cursor;
        request.params[limitParameter] = limit;
        break;
      }
      default: {
        throw new Error(
          `Error while paginating request. Unknown pagination type: '${paginationType}'.`
        );
      }
    }
  }

  private paginateBody(
    request: AxiosRequestConfig,
    paginationType: TransferType,
    paginationOptions: IRequestPaginationOptions,
    pagination: IOffsetPagination | ICursorPagination
  ) {
    switch (paginationType) {
      case TransferType.OFFSET_PAGINATION: {
        const { offsetParameter, limitParameter } = paginationOptions;
        const { offset, limit } = pagination as IOffsetPagination;

        request.data = request.data || {};

        request.data[offsetParameter] = offset;
        request.data[limitParameter] = limit;
        break;
      }
      case TransferType.CURSOR_PAGINATION: {
        const { cursorParameter, limitParameter } = paginationOptions;
        const { cursor, limit } = pagination as ICursorPagination;

        request.data = request.data || {};

        request.data[cursorParameter] = cursor;
        request.data[limitParameter] = limit;
        break;
      }
      default: {
        throw new Error(
          `Error while paginating request. Unknown pagination type: '${paginationType}'.`
        );
      }
    }
  }
}

export default PaginateRequestHelper;
