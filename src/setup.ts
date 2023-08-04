import { Server as IO } from 'socket.io';

import SynchronizationsRouter from './modules/synchronizations/synchronizations.router';
import setupServices from './setups/services.setup';
import setupControllers from './setups/controllers.setup';
import setupRouters from './setups/routers.setup';
import OAuth2Router from './modules/oauth2/oauth2.router';
import TransfersRouter from './modules/transfers/transfers.router';

export interface ISetupParams {
  io: IO;
  clientUri: string;
  oAuth2RedirectUri: string;
}

export interface ISetupResult {
  synchronizationsRouter: SynchronizationsRouter;
  transfersRouter: TransfersRouter;
  oAuth2Router: OAuth2Router;
}

export default function setupImport(params: ISetupParams): ISetupResult {
  const { io, clientUri, oAuth2RedirectUri } = params;

  const { synchronizationsService, transfersService, oAuth2Service } =
    setupServices(io, clientUri, oAuth2RedirectUri);

  const { synchronizationsController, transfersController, oAuth2Controller } =
    setupControllers(synchronizationsService, transfersService, oAuth2Service);

  const { synchronizationsRouter, transfersRouter, oAuth2Router } =
    setupRouters(
      synchronizationsController,
      transfersController,
      oAuth2Controller
    );

  return {
    synchronizationsRouter,
    transfersRouter,
    oAuth2Router
  };
}
