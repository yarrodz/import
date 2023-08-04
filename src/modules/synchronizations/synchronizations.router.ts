import { Router } from 'express';

import SynchronizationsController from './synchronizations.controller';

class SynchronizationsRouter {
  public router: Router;
  private synchronizationsController: SynchronizationsController;

  constructor(SynchronizationsController: SynchronizationsController) {
    this.router = Router();
    this.synchronizationsController = SynchronizationsController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/:unitId', this.synchronizationsController.findAll);
    this.router.post('/', this.synchronizationsController.create);
    this.router.put('/', this.synchronizationsController.update);
    this.router.delete('/:id', this.synchronizationsController.delete);
    this.router.post('/columns', this.synchronizationsController.getColumns);
    this.router.post(
      '/importFields',
      this.synchronizationsController.setImportFields
    );
    this.router.post('/import', this.synchronizationsController.import);
  }
}

export default SynchronizationsRouter;
