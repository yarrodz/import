import { Server as IO } from 'socket.io';
import { Model } from 'mongoose';

import { IRecord } from './modules/records/record.interface';
import { IDataset } from './modules/datasets/dataset.interface';
import setupRepositories from './setups/repositories.setup';
import setupServices from './setups/services.setup';
import setupControllers from './setups/controllers.setup';
import setupRouters from './setups/routers.setup';
import ImportsRouter from './modules/imports/imports.router';
import ImportProcessesRouter from './modules/import-processes/import-processes.router';
import OAuth2Router from './modules/oauth2/oauth2.router';
import createPendingImportProcessesReloaderFunction from './modules/import-processes/pending-import-processes.reloader';

export interface ISetupParams {
  io: IO;
  recordModel: Model<IRecord>;
  datasetModel: Model<IDataset>;
  maxAttempts: number;
  attemptDelayTime: number;
  oAuth2RedirectUri: string;
  clientUri: string;
}

export interface ISetupResult {
  importsRouter: ImportsRouter;
  importProcessesRouter: ImportProcessesRouter;
  oAuth2Router: OAuth2Router;
  reloadPendingImportProcesses: Function;
}

export default function setupImport(params: ISetupParams): ISetupResult {
  const {
    io,
    recordModel,
    datasetModel,
    maxAttempts,
    attemptDelayTime,
    oAuth2RedirectUri,
    clientUri
  } = params;

  const { datasetsRepository, importsRepository, importProcessesRepository } =
    setupRepositories(recordModel, datasetModel);

  const {
    importsService,
    importProcessesService,
    oAuth2Service,
    sqlTransferHelper,
    apiTransferHelper
  } = setupServices(
    io,
    datasetsRepository,
    importsRepository,
    importProcessesRepository,
    maxAttempts,
    attemptDelayTime,
    oAuth2RedirectUri,
    clientUri
  );

  const reloadPendingImportProcesses =
    createPendingImportProcessesReloaderFunction(
      importProcessesRepository,
      importsRepository,
      sqlTransferHelper,
      apiTransferHelper
    );

  const { importsController, importProcessesController, oAuthController } =
    setupControllers(importsService, importProcessesService, oAuth2Service);

  const { importsRouter, importProcessesRouter, oAuth2Router } = setupRouters(
    importsController,
    importProcessesController,
    oAuthController
  );

  return {
    importsRouter,
    importProcessesRouter,
    oAuth2Router,
    reloadPendingImportProcesses
  };
}
