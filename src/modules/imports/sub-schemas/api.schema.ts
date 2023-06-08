import mongoose, { Document, Schema } from 'mongoose';
import { RequestMethod } from '../enums/request-method.enum';

export interface IApiConfig {
  method: RequestMethod;
  url: string;
  headers: object;
  params: object;
  data: object;
}

interface IApi {
  config: IApiConfig;
  path: string;
}

export interface IApiModel extends IApi, Document {}

export const ApiSchema = new Schema({
  config: { type: Schema.Types.Mixed, required: true },
  path: { type: String, default: 'data' }
});

export default mongoose.model<IApi>('Api', ApiSchema);
