import { Schema } from 'mongoose';

import {
  IRequestAuth,
  RequestAuthSchema
} from './request-sub-schemas/request-auth.shema';
// import {
//   IRequestBody,
//   RequestBodySchema
// } from './request-sub-schemas/request-body.shema';
import {
  IRequestPaginationOptions,
  RequestPaginationOptionsSchema
} from './request-sub-schemas/request-pagination-options.schema';
import { RequestMethod } from '../enums/request-method.enum';
// import { RequestResponseType } from '../enums/request-response-type.enum';

export interface IRequest {
  method: RequestMethod;
  url: string;
  auth?: IRequestAuth;
  headers?: object;
  params?: object;
  // body?: IRequestBody;
  body?: object;
  paginationOptions?: IRequestPaginationOptions;
  // responseType: RequestResponseType;
  responsePath: string;
}

export const RequestSchema = new Schema<IRequest>(
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
    // body: { type: RequestBodySchema, required: false },
    body: { type: Object, required: false },
    paginationOptions: {
      type: RequestPaginationOptionsSchema,
      required: false
    },
    // responseType: {
    //   type: String,
    //   enum: Object.values(RequestResponseType),
    //   required: true
    // },
    responsePath: { type: String, required: true }
  },
  {
    _id: false
  }
);
