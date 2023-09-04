import { Router } from 'express';

import SchedulersController from './schedulers.controller';

class SchedulersRouter {
  public router: Router;
  private schedulersController: SchedulersController;

  constructor(schedulersController: SchedulersController) {
    this.router = Router();
    this.schedulersController = schedulersController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/getAll', this.schedulersController.getAll);
    this.router.get('/:id', this.schedulersController.get);
    this.router.post('/', this.schedulersController.create);
    this.router.patch('/', this.schedulersController.update);
    this.router.delete('/:id', this.schedulersController.delete);
  }
}

export default SchedulersRouter;
