import { Router } from 'express';

import SynchronizationsController from './imports.controller';

class ImportsRouter {
  public router: Router;
  private synchronizationsController: SynchronizationsController;

  constructor(SynchronizationsController: SynchronizationsController) {
    this.router = Router();
    this.synchronizationsController = SynchronizationsController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get('/', this.synchronizationsController.getAll);
    this.router.get('/:id', this.synchronizationsController.get);
    this.router.post('/', this.synchronizationsController.create);
    this.router.patch('/', this.synchronizationsController.update);
    this.router.delete('/:id', this.synchronizationsController.delete);
    this.router.get('/:id/columns', this.synchronizationsController.getColumns);
    this.router.get(
      '/:id/idColumnUniqueness',
      this.synchronizationsController.checkIdColumnUniqueness
    );
    this.router.post('/import', this.synchronizationsController.import);
  }
}

export default ImportsRouter;
