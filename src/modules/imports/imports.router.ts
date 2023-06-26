import { Router } from 'express';

import ImportsController from './imports.controller';

class ImportsRouter {
  public router: Router;
  private importsController: ImportsController;

  constructor(importsController: ImportsController) {
    this.router = Router();
    this.importsController = importsController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/:unitId', this.importsController.findAll);
    this.router.post('/', this.importsController.create);
    this.router.put('/', this.importsController.update);
    this.router.delete('/:id', this.importsController.delete);
    this.router.post('/connect', this.importsController.connect);
    this.router.post('/setFields', this.importsController.setFields);
    this.router.post('/start', this.importsController.start);
  }
}

export default ImportsRouter;
