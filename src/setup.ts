import { Server as IO } from 'socket.io';

import setupServices from './setups/services.setup';
import setupControllers from './setups/controllers.setup';
import setupRouters from './setups/routers.setup';
import OAuth2Router from './modules/oauth2/oauth2.router';
import TransfersRouter from './modules/transfers/transfers.router';
import ConnectionsRouter from './modules/connections/connections.router';
import ImportsRouter from './modules/imports/imports.router';

export interface ISetupParams {
  io: IO;
  clientUri: string;
  oAuth2RedirectUri: string;
}

export interface ISetupResult {
  connectionsRouter: ConnectionsRouter;
  importsRouter: ImportsRouter;
  transfersRouter: TransfersRouter;
  oAuth2Router: OAuth2Router;
}

export default function setupImport(params: ISetupParams): ISetupResult {
  const { io, clientUri, oAuth2RedirectUri } = params;

  const { importsService, transfersService, oAuth2Service } = setupServices(
    io,
    clientUri,
    oAuth2RedirectUri
  );

  const { importsController, transfersController, oAuth2Controller } =
    setupControllers(importsService, transfersService, oAuth2Service);

  const { connectionsRouter, importsRouter, transfersRouter, oAuth2Router } =
    setupRouters(importsController, transfersController, oAuth2Controller);

  return {
    connectionsRouter,
    importsRouter,
    transfersRouter,
    oAuth2Router
  };
}
