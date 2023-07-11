import ImportProcessesController from '../modules/import-processes/import-processes.controller';
import ImportProcessesRouter from '../modules/import-processes/import-processes.router';
import ImportsController from '../modules/imports/imports.controller';
import ImportsRouter from '../modules/imports/imports.router';
import OAuthController from '../modules/oauth2/oauth2.controller';
import OAuthRouter from '../modules/oauth2/oauth2.router';

export default function setupRouters(
  importsController: ImportsController,
  importProcessesController: ImportProcessesController,
  oAuthController: OAuthController
): {
  importsRouter: ImportsRouter;
  importProcessesRouter: ImportProcessesRouter;
  oAuthRouter: OAuthRouter;
} {
  const importsRouter = new ImportsRouter(importsController);
  const importProcessesRouter = new ImportProcessesRouter(
    importProcessesController
  );
  const oAuthRouter = new OAuthRouter(oAuthController);

  return {
    importsRouter,
    importProcessesRouter,
    oAuthRouter
  };
}
