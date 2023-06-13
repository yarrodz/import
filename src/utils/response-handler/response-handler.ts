import { Response } from 'express';

import { ResponseType } from './response-type.enum';

export default class ResponseHandler {
  constructor(
    private type?: ResponseType,
    private statusCode?: number,
    private result?: any,
    private message?: string | object
  ) {}

  setSuccess(statusCode: number, result: any) {
    this.type = ResponseType.SUCCESS;
    this.statusCode = statusCode;
    this.result = result;
  }

  setError(statusCode: number, message: string | object) {
    this.type = ResponseType.ERROR;
    this.statusCode = statusCode;
    this.message = message;
  }

  send(res: Response) {
    if (this.type === ResponseType.SUCCESS) {
      res.status(this.statusCode).json(this.result);
    } else {
      res.status(this.statusCode).json({ message: this.message });
    }
  }
}
