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

  public async send(
    pagination?: IOffsetPagination | ICursorPagination
  ): Promise<object[]> {
    try {
      if (pagination) {
        this.paginateRequest(pagination);
      }
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

  private paginateRequest(pagination: IOffsetPagination | ICursorPagination) {
    // console.log("this.request: ", this.request);
    // console.log("this.paginationType: ", this.paginationType);
    // console.log("this.paginationOptions: ", this.paginationOptions);
    // console.log("pagination: ", pagination);
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
