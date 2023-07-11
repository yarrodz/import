import ImportProcessesController from '../modules/import-processes/import-processes.controller';
import ImportProcessesService from '../modules/import-processes/import-processes.service';
import ImportsController from '../modules/imports/imports.controller';
import ImportsService from '../modules/imports/imports.service';
import OAuthService from '../modules/oauth2/oauth2.service';
import OAuthController from '../modules/oauth2/oauth2.controller';

export default function setupControllers(
  importsService: ImportsService,
  importProcessesService: ImportProcessesService,
  oAuthService: OAuthService
): {
  importsController: ImportsController;
  importProcessesController: ImportProcessesController;
  oAuthController: OAuthController;
} {
  const importsController = new ImportsController(importsService);
  const importProcessesController = new ImportProcessesController(
    importProcessesService
  );
  const oAuthController = new OAuthController(oAuthService);
  return {
    importsController,
    importProcessesController,
    oAuthController
  };
}
