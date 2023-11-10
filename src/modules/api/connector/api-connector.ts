import axios, { AxiosRequestConfig } from 'axios';

import { AuthRequestHelper } from '../helpers/auth-request.helper';
import { PaginateRequestHelper } from '../helpers/paginate-request.helper';
import { TransferMethod } from '../../transfer-processes/enums/transfer-method.enum';
import { RequestPaginationOptions } from '../interfaces/request-pagination-options.interface';
import { ApiConnection } from '../interfaces/api-connection.interface';
import { OffsetPagination } from '../../transfer-processes/interfaces/offset-pagination.interface';
import { CursorPagination } from '../../transfer-processes/interfaces/cursor-pagination.interface';
import { ApiIframeTransfer } from '../interfaces/api-iframe-transfer.interface';

export class ApiConnector {
  private request: AxiosRequestConfig;
  private auth?: ApiConnection;
  private paginationType?: TransferMethod;
  private paginationOptions?: RequestPaginationOptions;

  constructor(transfer: ApiIframeTransfer) {
    const {
      request,
      transferMethod,
      paginationOptions,
      __: relations
    } = transfer;
    
    const connection = relations.connection as ApiConnection;

    this.request = { ...request, data: request.body };
    this.auth = connection;
    this.paginationType = transferMethod;
    this.paginationOptions = paginationOptions;
  }

  public async sendRequest(): Promise<any> {
    try {
      return await axios(this.request);
    } catch (error) {
      throw new Error(`Error while sending request: ${error.message}`);
    }
  }

  public async authRequest() {
    await AuthRequestHelper.auth(this.request, this.auth);
  }

  public paginateRequest(pagination: OffsetPagination | CursorPagination) {
    PaginateRequestHelper.paginate(
      this.request,
      this.paginationType,
      this.paginationOptions,
      pagination
    );
  }
}
