import { Router } from 'express';

import OAuthController from './oauth2.controller';

class OAuth2Router {
  public router: Router;
  private oAuthController: OAuthController;

  constructor(oAuthController: OAuthController) {
    this.router = Router();
    this.oAuthController = oAuthController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/oauth-callback', this.oAuthController.oAuth2Callback);
  }
}

export default OAuth2Router;
