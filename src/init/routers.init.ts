import { InitControllersResult } from './controllers.init';
import { ConnectionsRouter } from '../modules/connections/connections.router';
import { ImportsRouter } from '../modules/transfers/transfers.router';
import { OAuth2Router } from '../modules/oauth2/oauth2.router';
import { TransfersRouter } from '../modules/transfer-processes/transfer-processes.router';
import { SchedulersRouter } from '../modules/scheduler/shcedulers.router';

export interface InitRoutersResult {
  connectionsRouter: ConnectionsRouter;
  importsRouter: ImportsRouter;
  transfersRouter: TransfersRouter;
  schedulersRouter: SchedulersRouter;
  oAuth2Router: OAuth2Router;
}

export function initRouters(params: InitControllersResult): InitRoutersResult {
  const {
    connectionsController,
    importsController,
    transfersController,
    schedulersController,
    oAuth2Controller
  } = params;

  const connectionsRouter = new ConnectionsRouter(connectionsController);
  const importsRouter = new ImportsRouter(importsController);
  const transfersRouter = new TransfersRouter(transfersController);
  const schedulersRouter = new SchedulersRouter(schedulersController);
  const oAuth2Router = new OAuth2Router(oAuth2Controller);

  return {
    connectionsRouter,
    importsRouter,
    transfersRouter,
    schedulersRouter,
    oAuth2Router
  };
}
