import { Router } from 'express';
import ImportProcessesController from './import-processes.controller';

class ImportProcessesRouter {
  public router: Router;
  private importProcessesController: ImportProcessesController;

  constructor(importProcessesController: ImportProcessesController) {
    this.router = Router();
    this.importProcessesController = importProcessesController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/:unitId', this.importProcessesController.findAll);
    this.router.delete('/:id', this.importProcessesController.delete);
    this.router.post('/pause', this.importProcessesController.pause);
    this.router.post('/reload', this.importProcessesController.reload);
    this.router.post('/retry', this.importProcessesController.retry);
  }
}

export default ImportProcessesRouter;
