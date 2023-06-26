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
} {
  const { datasetsRepository, importsRepository, importProcessesRepository } =
    setupRepositories(recordModel, datasetModel);

  const { importsService, importProcessesService } = setupServices(
    io,
    datasetsRepository,
    importsRepository,
    importProcessesRepository,
    maxAttempts,
    attemptDelayTime,
    limit
  );

  const { importsController, importProcessesController } = setupControllers(
    importsService,
    importProcessesService
  );

  const { importsRouter, importProcessesRouter } = setupRouters(
    importsController,
    importProcessesController
  );

  return { importsRouter, importProcessesRouter };
}
