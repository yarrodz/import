import { Schema } from 'mongoose';
import { AxiosRequestConfig } from 'axios';

import { RequestMethod } from '../enums/request-method.enum';

export interface IApiRequestConfig extends AxiosRequestConfig {
  method: RequestMethod;
  url: string;
  headers?: object;
  params?: object;
  data?: object;
}

export const ApiRequestConfigSchema = new Schema<IApiRequestConfig>(
  {
    method: {
      type: String,
      enum: Object.values(RequestMethod),
      required: true
    },
    url: { type: String, default: 'data' },
    headers: { type: Object, default: 'data' },
    params: { type: Object, default: 'data' },
    data: { type: Object, default: 'data' }
  },
  {
    _id: false
  }
);

export interface IApi {
  requestConfig: IApiRequestConfig;
  idColumn: string;
  path: string;
}

export const ApiSchema = new Schema<IApi>(
  {
    requestConfig: { type: ApiRequestConfigSchema, required: true },
    idColumn: { type: String, required: true },
    path: { type: String, required: true }
  },
  {
    _id: false
  }
);
