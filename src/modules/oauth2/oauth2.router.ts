import { Router } from 'express';

import { OAuth2Controller } from './oauth2.controller';

export class OAuth2Router {
  public router: Router;
  private oAuth2Controller: OAuth2Controller;

  constructor(oAuth2Controller: OAuth2Controller) {
    this.router = Router();
    this.oAuth2Controller = oAuth2Controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/oauth-callback', this.oAuth2Controller.oAuth2Callback);
  }
}
