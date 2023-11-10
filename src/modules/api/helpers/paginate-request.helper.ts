import { AxiosRequestConfig } from 'axios';

import { TransferMethod } from '../../transfer-processes/enums/transfer-method.enum';
import { RequestPaginationOptions } from '../interfaces/request-pagination-options.interface';
import { OffsetPagination } from '../../transfer-processes/interfaces/offset-pagination.interface';
import { CursorPagination } from '../../transfer-processes/interfaces/cursor-pagination.interface';
import { RequestPaginationPlacement } from '../enums/request-pagination-placement';

export class PaginateRequestHelper {
  public static paginate(
    request: AxiosRequestConfig,
    paginationType: TransferMethod,
    paginationOptions?: RequestPaginationOptions,
    pagination?: OffsetPagination | CursorPagination
  ) {
    if (paginationOptions === undefined || pagination === undefined) {
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

  private static paginateQueryParams(
    request: AxiosRequestConfig,
    paginationType: TransferMethod,
    paginationOptions: RequestPaginationOptions,
    pagination: OffsetPagination | CursorPagination
  ) {
    switch (paginationType) {
      case TransferMethod.OFFSET_PAGINATION: {
        const { offsetKey, limitKey } = paginationOptions;
        const { offset, limit } = pagination as OffsetPagination;

        request.params = request.params || {};

        request.params[offsetKey] = offset;
        request.params[limitKey] = limit;
        break;
      }
      case TransferMethod.CURSOR_PAGINATION: {
        const { cursorKey, limitKey } = paginationOptions;
        const { cursor, limit } = pagination as CursorPagination;

        request.params = request.params || {};

        request.params[cursorKey] = cursor;
        request.params[limitKey] = limit;
        break;
      }
      default: {
        throw new Error(
          `Error while paginating request. Unknown pagination type: '${paginationType}'.`
        );
      }
    }
  }

  private static paginateBody(
    request: AxiosRequestConfig,
    paginationType: TransferMethod,
    paginationOptions: RequestPaginationOptions,
    pagination: OffsetPagination | CursorPagination
  ) {
    switch (paginationType) {
      case TransferMethod.OFFSET_PAGINATION: {
        const { offsetKey, limitKey } = paginationOptions;
        const { offset, limit } = pagination as OffsetPagination;

        request.data = request.data || {};

        request.data[offsetKey] = offset;
        request.data[limitKey] = limit;
        break;
      }
      case TransferMethod.CURSOR_PAGINATION: {
        const { cursorKey, limitKey } = paginationOptions;
        const { cursor, limit } = pagination as CursorPagination;

        request.data = request.data || {};

        request.data[cursorKey] = cursor;
        request.data[limitKey] = limit;
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
