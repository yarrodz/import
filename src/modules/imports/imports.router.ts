import { Router } from 'express';

import ImportsController from './imports.controller';

class ImportsRouter {
  public router: Router;
  private importsController: ImportsController;

  constructor(ImportsController: ImportsController) {
    this.router = Router();
    this.importsController = ImportsController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/getAll', this.importsController.getAll);
    this.router.get('/:id', this.importsController.get);
    this.router.post('/', this.importsController.create);
    this.router.patch('/', this.importsController.update);
    this.router.delete('/:id', this.importsController.delete);
    this.router.post('/columns', this.importsController.getColumns);
    this.router.post('/idColumnUniqueness',this.importsController.checkIdColumnUniqueness);
    this.router.post('/import', this.importsController.import);
  }
}

export default ImportsRouter;
