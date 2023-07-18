import { Schema } from 'mongoose';

import {
  IRequestAuth,
  RequestAuthSchema
} from './sub-schemas/api-sub-schemas/request-auth.shema';
// import {
//   IRequestBody,
//   RequestBodySchema
// } from './request-sub-schemas/request-body.shema';
import {
  IRequestPaginationOptions,
  RequestPaginationOptionsSchema
} from './sub-schemas/api-sub-schemas/request-pagination-options.schema';
import { RequestMethod } from './enums/request-method.enum';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import { RequestResponseType } from './enums/request-response-type.enum';

export interface IApi {
  method: RequestMethod;
  url: string;
  auth?: IRequestAuth;
  headers?: object;
  params?: object;
  // body?: IRequestBody;
  body?: object;
  transferType: TransferType;
  paginationOptions?: IRequestPaginationOptions;
  responseType: RequestResponseType;
  datasetsPath: string;
}

export const ApiSchema = new Schema<IApi>(
  {
    method: {
      type: String,
      enum: Object.values(RequestMethod),
      required: true
    },
    url: { type: String, required: true },
    auth: { type: RequestAuthSchema, required: false },
    headers: { type: Object, required: false },
    params: { type: Object, required: false },
    // body:  { type: RequestBodySchema, required: false },
    body: { type: Object, required: false },
    transferType: {
      type: String,
      enum: Object.values(TransferType),
      required: true
    },
    paginationOptions: {
      type: RequestPaginationOptionsSchema,
      required: false
    },
    responseType: {
      type: String,
      enum: Object.values(RequestResponseType),
      required: true
    },
    datasetsPath: { type: String, required: true }
  },
  {
    _id: false
  }
);
