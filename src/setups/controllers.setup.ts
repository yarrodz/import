import ImportProcessesController from '../modules/import-processes/import-processes.controller';
import ImportProcessesService from '../modules/import-processes/import-processes.service';
import ImportsController from '../modules/imports/imports.controller';
import ImportsService from '../modules/imports/imports.service';
import OAuth2Controller from '../modules/oauth2/oauth2.controller';
import OAuth2Service from '../modules/oauth2/oauth2.service';

export default function setupControllers(
  importsService: ImportsService,
  importProcessesService: ImportProcessesService,
  oAuth2Service: OAuth2Service
): {
  importsController: ImportsController;
  importProcessesController: ImportProcessesController;
  oAuthController: OAuth2Controller;
} {
  const importsController = new ImportsController(importsService);
  const importProcessesController = new ImportProcessesController(
    importProcessesService
  );
  const oAuthController = new OAuth2Controller(oAuth2Service);
  return {
    importsController,
    importProcessesController,
    oAuthController
  };
}
