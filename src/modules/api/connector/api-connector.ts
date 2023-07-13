import axios, { AxiosRequestConfig } from 'axios';

import AuthRequestHelper from './auth-request.helper';
import PaginateRequestHelper from './paginate-request.helper';
import { IRequest } from '../sub-schemas/request.schema';
import { IRequestAuth } from '../sub-schemas/request-sub-schemas/request-auth.shema';
import { IRequestPaginationOptions } from '../sub-schemas/request-sub-schemas/request-pagination-options.schema';
import IPagination from '../../transfer/interfaces/pagination.interface';

class ApiConnector {
  private authRequestHelper: AuthRequestHelper;
  private paginateRequestHelper: PaginateRequestHelper;

  private request: AxiosRequestConfig;
  private responsePath: string;
  private auth?: IRequestAuth;
  private paginationOptions?: IRequestPaginationOptions;

  constructor(request: IRequest) {
    this.authRequestHelper = new AuthRequestHelper();
    this.paginateRequestHelper = new PaginateRequestHelper();

    const {
      method,
      url,
      auth,
      headers,
      params,
      body,
      paginationOptions,
      responsePath
    } = request;

    this.request = {
      method,
      url,
      headers,
      params,
      data: body
    };
    this.responsePath = responsePath;
    this.auth = auth;
    this.paginationOptions = paginationOptions;
  }

  public async send(pagination?: IPagination): Promise<object[]> {
    try {
      if (pagination) {
        this.paginateRequest(pagination);
      }
      const data = await axios(this.request);
      const response = this.resolveResponsePath(data);
      // console.log('Name:', response[0]['properties']['Name'])
      // console.log('typeof:', typeof response[0]['properties']['Name'])
      console.log(response)
      return response;
    } catch (error) {
      console.error('error: ', error)
      throw new Error(`Error while sending request: ${error.message}`);
    }
  }

  public async authorizeRequest() {
    await this.authRequestHelper.auth(this.request, this.auth);
  }

  private paginateRequest(pagination: IPagination) {
    this.paginateRequestHelper.paginate(
      this.request,
      this.paginationOptions,
      pagination
    );
  }

  private resolveResponsePath(data: object): object[] {
    try {
      const properties = this.responsePath.split('.');
      let currentPath = data;
      for (const property of properties) {
        currentPath = currentPath[property];
      }
      return currentPath as object[];
    } catch (error) {
      throw new Error(`Error while searching for response: ${error.message}`);
    }
  }
}

export default ApiConnector;
