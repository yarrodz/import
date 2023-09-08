import { RequestMethod } from '../enums/request-method.enum';

export interface Request {
  method: RequestMethod;
  url: string;
  headers?: object;
  params?: object;
  body?: object;
}
