import axios, { AxiosRequestConfig } from 'axios';

import AuthRequestHelper from './auth-request.helper';
import PaginateRequestHelper from './paginate-request.helper';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import RequestPaginationOptions from '../interfaces/request-pagination-options.interface';
import ApiConnection from '../interfaces/api-connection.interface';
import ApiImport from '../interfaces/api-import.interface';
import ApiExport from '../interfaces/api-export.interface';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';

class ApiConnector {
  private request: AxiosRequestConfig;
  private auth?: ApiConnection;
  private paginationType?: TransferMethod;
  private paginationOptions?: RequestPaginationOptions;

  constructor(importOrExport: ApiImport, connection: ApiConnection) {
    const { request, transferMethod, paginationOptions } = importOrExport;

    this.request = { ...request, data: request.body };
    this.auth = connection;
    this.paginationType = transferMethod;
    this.paginationOptions = paginationOptions;
  }

  public async sendRequest(): Promise<any> {
    try {
      return await axios(this.request);
    } catch (error) {
      // console.error('error sendRequest: ', error)
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

export default ApiConnector;
