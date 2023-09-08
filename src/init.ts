import { Server as IO } from 'socket.io';
import { iFrameDbClient } from 'iframe-ai';

import { InitRoutersResult } from './init/routers.init';
import { initRepositories } from './init/repositories.init';
import { initServices } from './init/services.init';
import { initControllers } from './init/controllers.init';
import { initRouters } from './init/routers.init';
import { PendingTransfersReloader } from './modules/transfers/helpers/transfers-reloader.helper';
import { SchedulersCron } from './modules/scheduler/schedulers.cron';

export interface InitParams {
  io: IO;
  dbClient: iFrameDbClient;
  clientUri: string;
  oAuth2RedirectUri: string;
}

export interface InitResult extends InitRoutersResult {
  pendingTransfersReloader: PendingTransfersReloader;
  schedulersCron: SchedulersCron;
}

export function initImports(params: InitParams): InitResult {
  const { io, dbClient, clientUri, oAuth2RedirectUri } = params;

  const initRepositoriesResult = initRepositories(dbClient);

  const initServicesResult = initServices({
    io,
    clientUri,
    oAuth2RedirectUri,
    ...initRepositoriesResult
  });

  const { schedulersCron, pendingTransfersReloader } = initServicesResult;

  const initControllersResult = initControllers(initServicesResult);

  const InitRoutersResult = initRouters(initControllersResult);

  return {
    ...InitRoutersResult,
    pendingTransfersReloader,
    schedulersCron
  };
}
