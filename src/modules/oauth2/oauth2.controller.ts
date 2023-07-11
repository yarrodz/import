import { Request, Response } from 'express';

import OAuth2Service from './oauth2.service';

class OAuth2Controller {
  private oAuth2Service: OAuth2Service;

  constructor(oAuthService: OAuth2Service) {
    this.oAuth2Service = oAuthService;
  }

  oauthCallback = async (req: Request, res: Response) => {
    const responseHandler = await this.oAuth2Service.oAuth2Callback(req);
    responseHandler.send(res);
  };
}

export default OAuth2Controller;
