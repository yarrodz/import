import { Response } from 'express';

import { ResponseHandlerType } from './response-handler-type.enum';

export default class ResponseHandler {
  constructor(
    private type?: ResponseHandlerType,
    private statusCode?: number,
    private result?: string | object,
    private message?: string | object,
    private redirectLink?: string
  ) {}

  setSuccess(statusCode: number, result: any) {
    this.type = ResponseHandlerType.SUCCESS;
    this.statusCode = statusCode;
    this.result = result;
  }

  setError(statusCode: number, message: string | object) {
    this.type = ResponseHandlerType.ERROR;
    this.statusCode = statusCode;
    this.message = message;
  }

  setRedirect(link: string) {
    this.type = ResponseHandlerType.REDIRECT;
    this.statusCode = 302;
    this.redirectLink = link;
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
        res.status(this.statusCode).redirect(this.redirectLink);
        break;
      default:
        throw new Error('Unknown response type for response handler');
    }
  }
}
