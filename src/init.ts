import { Server as IO } from 'socket.io';
import { iFrameDbClient } from 'iframe-ai';

import { InitRoutersResult } from './init/routers.init';
import initRepositories from './init/repositories.init';
import initServices from './init/services.init';
import initControllers from './init/controllers.init';
import initRouters from './init/routers.init';

export interface InitParams {
  io: IO;
  dbClient: iFrameDbClient;
  clientUri: string;
  oAuth2RedirectUri: string;
}

export default function initTransfers(params: InitParams): InitRoutersResult {
  const { io, dbClient, clientUri, oAuth2RedirectUri } = params;

  const initRepositoriesResult = initRepositories(dbClient);

  const initServicesResult = initServices({
    io,
    clientUri,
    oAuth2RedirectUri,
    ...initRepositoriesResult
  });

  const initControllersResult = initControllers(initServicesResult);

  const InitRoutersResult = initRouters(initControllersResult);

  return InitRoutersResult;
}
