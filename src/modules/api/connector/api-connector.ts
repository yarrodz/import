import axios, { AxiosRequestConfig } from 'axios';

import { IApi } from '../api.schema';
import AuthRequestHelper from './auth-request.helper';
import PaginateRequestHelper from './paginate-request.helper';
import ParseResponseHelper from './parse-response.helper';
import { IRequestAuth } from '../sub-schemas/api-sub-schemas/request-auth.shema';
import { IRequestPaginationOptions } from '../sub-schemas/api-sub-schemas/request-pagination-options.schema';
import { RequestResponseType } from '../enums/request-response-type.enum';
import { TransferType } from '../../transfer/enums/transfer-type.enum';
import IOffsetPagination from '../../transfer/interfaces/offset-pagination.interface';
import ICursorPagination from '../../transfer/interfaces/cursor-pagination.interface';

class ApiConnector {
  private authRequestHelper: AuthRequestHelper;
  private paginateRequestHelper: PaginateRequestHelper;
  private parseResponseHelper: ParseResponseHelper;

  private request: AxiosRequestConfig;
  private auth?: IRequestAuth;
  private paginationType?: TransferType;
  private paginationOptions?: IRequestPaginationOptions;
  private responseType: RequestResponseType;

  constructor(api: IApi) {
    this.authRequestHelper = new AuthRequestHelper();
    this.paginateRequestHelper = new PaginateRequestHelper();
    this.parseResponseHelper = new ParseResponseHelper();

    const {
      method,
      url,
      auth,
      headers,
      params,
      body,
      transferType,
      paginationOptions,
      responseType
    } = api;

    this.request = {
      method,
      url,
      headers,
      params,
      data: body
    };
    this.auth = auth;
    this.paginationType = transferType;
    this.paginationOptions = paginationOptions;
    this.responseType = responseType;
  }

  public async sendRequest(): Promise<object[]> {
    try {
      const response = await axios(this.request);
      const parsedResponse = this.parseResponse(response, this.responseType);
      return parsedResponse;
    } catch (error) {
      throw new Error(`Error while sending request: ${error.message}`);
    }
  }

  public async authorizeRequest() {
    await this.authRequestHelper.auth(this.request, this.auth);
  }

  public paginateRequest(pagination: IOffsetPagination | ICursorPagination) {
    this.paginateRequestHelper.paginate(
      this.request,
      this.paginationType,
      this.paginationOptions,
      pagination
    );
  }

  private parseResponse(data: any, responseType: RequestResponseType) {
    return this.parseResponseHelper.parse(data, responseType);
  }
}

export default ApiConnector;
