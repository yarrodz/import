import { Response } from 'express';

import { ResponseHandlerType } from './response-handler-type.enum';

export default class ResponseHandler {
  constructor(
    private type?: ResponseHandlerType,
    private statusCode?: number,
    private result?: any,
    private message?: any,
    private redirectUri?: string
  ) {}

  setSuccess(statusCode: number, result: any) {
    this.type = ResponseHandlerType.SUCCESS;
    this.statusCode = statusCode;
    this.result = result;
    return this;
  }

  setError(statusCode: number, message: any) {
    this.type = ResponseHandlerType.ERROR;
    this.statusCode = statusCode;
    this.message = message;
    return this;
  }

  setRedirect(uri: string) {
    this.type = ResponseHandlerType.REDIRECT;
    this.statusCode = 201;
    this.redirectUri = uri;
    return this;
  }

  send(res: Response) {
    switch (this.type) {
      case ResponseHandlerType.SUCCESS:
        res.status(this.statusCode).json(this.result);
        break;
      case ResponseHandlerType.ERROR:
        res.status(this.statusCode).json({ message: this.message });
        break;
      case ResponseHandlerType.REDIRECT:
        res.status(this.statusCode).redirect(this.redirectUri);
        break;
      default:
        throw new Error(`Unknown response handler type.`);
    }
  }
}
