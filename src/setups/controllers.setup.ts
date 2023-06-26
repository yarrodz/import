import ImportProcessesController from '../modules/import-processes/import-processes.controller';
import ImportProcessesService from '../modules/import-processes/import-processes.service';
import ImportsController from '../modules/imports/imports.controller';
import ImportsService from '../modules/imports/imports.service';

export default function setupControllers(
  importsService: ImportsService,
  importProcessesService: ImportProcessesService
): {
  importsController: ImportsController;
  importProcessesController: ImportProcessesController;
} {
  const importsController = new ImportsController(importsService);
  const importProcessesController = new ImportProcessesController(
    importProcessesService
  );
  return {
    importsController,
    importProcessesController
  };
}
