import { InitControllersResult } from './controllers.init';
import ConnectionsRouter from '../modules/connections/connections.router';
import ImportsRouter from '../modules/imports/imports.router';
import OAuth2Router from '../modules/oauth2/oauth2.router';
import TransfersRouter from '../modules/transfers/transfers.router';

export interface InitRoutersResult {
  connectionsRouter: ConnectionsRouter;
  importsRouter: ImportsRouter;
  transfersRouter: TransfersRouter;
  oAuth2Router: OAuth2Router;
}

export default function initRouters(
  params: InitControllersResult
): InitRoutersResult {
  const {
    connectionsController,
    importsController,
    transfersController,
    oAuth2Controller
  } = params;

  const connectionsRouter = new ConnectionsRouter(connectionsController);
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
