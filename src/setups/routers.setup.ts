import ImportProcessesController from '../modules/import-processes/import-processes.controller';
import ImportProcessesRouter from '../modules/import-processes/import-processes.router';
import ImportsController from '../modules/imports/imports.controller';
import ImportsRouter from '../modules/imports/imports.router';

export default function setupRouters(
  importsController: ImportsController,
  importProcessesController: ImportProcessesController
): {
  importsRouter: ImportsRouter;
  importProcessesRouter: ImportProcessesRouter;
} {
  const importsRouter = new ImportsRouter(importsController);
  const importProcessesRouter = new ImportProcessesRouter(
    importProcessesController
  );

  return {
    importsRouter,
    importProcessesRouter
  };
}
