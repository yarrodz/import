import { Schema } from 'mongoose';

import { RequestMethod } from '../enums/request-method.enum';
import { RequestBodyType } from '../enums/request-body.enum';
import { TransferType } from '../../transfer/enums/transfer-type.enum';
import { ResponseType } from '../enums/response-type.enum';
import { ApiPaginationPlacement } from '../enums/api-paginanation-placement';

export interface IGraphqlBody {
  query: string;
  variables: string;
}

export interface IApiRequestConfig {
  method: RequestMethod;
  url: string;
  headers?: object;
  params?: object;
  bodyType: RequestBodyType;
  body?: object | IGraphqlBody;
  responseType: ResponseType;
}

export const ApiRequestConfigSchema = new Schema<IApiRequestConfig>(
  {
    method: {
      type: String,
      enum: Object.values(RequestMethod),
      required: true
    },
    url: { type: String, required: true },
    headers: { type: Object, required: false },
    params: { type: Object, required: false },
    bodyType: {
      type: String,
      enum: Object.values(RequestBodyType),
      required: true
    },
    body: { type: Object, required: false },
    responseType: {
      type: String,
      enum: Object.values(ResponseType),
      required: true
    }
  },
  {
    _id: false
  }
);

export interface IApiTransferOptions {
  offsetParameter?: string;
  limitParameter?: string;
  paginationPlacement?: ApiPaginationPlacement;
  path?: string;
}

export const ApiTransferOptionsSchema = new Schema<IApiTransferOptions>(
  {
    offsetParameter: { type: String, required: false },
    limitParameter: { type: String, required: false },
    paginationPlacement: {
      type: String,
      enum: Object.values(RequestBodyType),
      required: false
    },
    path: { type: String, required: false }
  },
  {
    _id: false
  }
);

export interface IApi {
  requestConfig: IApiRequestConfig;
  transferType: TransferType;
  transferOptions: IApiTransferOptions;
  idColumn: string;
  datasetsCount?: number;
  path: string;
}

export const ApiSchema = new Schema<IApi>(
  {
    requestConfig: { type: ApiRequestConfigSchema, required: true },
    transferType: {
      type: String,
      enum: Object.values(TransferType),
      required: true
    },
    transferOptions: { type: ApiTransferOptionsSchema, required: false },
    idColumn: { type: String, required: true },
    datasetsCount: { type: Number, required: false },
    path: { type: String, required: true }
  },
  {
    _id: false
  }
);
