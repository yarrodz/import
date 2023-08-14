import ConnectionsRouter from '../modules/connections/connections.router';
import ImportsController from '../modules/imports/imports.controller';
import ImportsRouter from '../modules/imports/imports.router';
import OAuth2Controller from '../modules/oauth2/oauth2.controller';
import OAuth2Router from '../modules/oauth2/oauth2.router';
import TransfersController from '../modules/transfers/transfers.controller';
import TransfersRouter from '../modules/transfers/transfers.router';

export default function setupRouters(
  importsController: ImportsController,
  transfersController: TransfersController,
  oAuth2Controller: OAuth2Controller
): {
  connectionsRouter: ConnectionsRouter;
  importsRouter: ImportsRouter;
  transfersRouter: TransfersRouter;
  oAuth2Router: OAuth2Router;
} {
  const connectionsRouter = new ConnectionsRouter();
  const importsRouter = new ImportsRouter(importsController);
  const transfersRouter = new TransfersRouter(transfersController);
  const oAuth2Router = new OAuth2Router(oAuth2Controller);

  return {
    connectionsRouter,
    importsRouter,
    transfersRouter,
    oAuth2Router
  };
}
