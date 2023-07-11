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
import OAuthRouter from './modules/oauth2/oauth2.router';

export default function setupImport(
  io: IO,
  recordModel: Model<IRecord>,
  datasetModel: Model<IDataset>,
  maxAttempts: number,
  attemptDelayTime: number,
  limit: number
): {
  importsRouter: ImportsRouter;
  importProcessesRouter: ImportProcessesRouter;
  oAuthRouter: OAuthRouter;
} {
  const { datasetsRepository, importsRepository, importProcessesRepository } =
    setupRepositories(recordModel, datasetModel);

  const { importsService, importProcessesService, oAuthService } =
    setupServices(
      io,
      datasetsRepository,
      importsRepository,
      importProcessesRepository,
      maxAttempts,
      attemptDelayTime,
      limit
    );

  const { importsController, importProcessesController, oAuthController } =
    setupControllers(importsService, importProcessesService, oAuthService);

  const { importsRouter, importProcessesRouter, oAuthRouter } = setupRouters(
    importsController,
    importProcessesController,
    oAuthController
  );

  return { importsRouter, importProcessesRouter, oAuthRouter };
}
