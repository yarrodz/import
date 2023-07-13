import { Schema } from 'mongoose';

import { IRequest, RequestSchema } from './sub-schemas/request.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';

export interface IApi {
  request: IRequest;
  transferType: TransferType;
  idColumn: string;
  limitPerSecond: number;
  datasetsCount?: number;
}

export const ApiSchema = new Schema<IApi>(
  {
    request: { type: RequestSchema, required: true },
    transferType: {
      type: String,
      enum: Object.values(TransferType),
      required: true
    },
    idColumn: { type: String, required: true },
    limitPerSecond: { type: Number, required: true },
    datasetsCount: { type: Number, required: false }
  },
  {
    _id: false
  }
);
