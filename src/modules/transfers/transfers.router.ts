import { Router } from 'express';
import TransfersController from './transfers.controller';

class TransfersRouter {
  public router: Router;
  private transfersController: TransfersController;

  constructor(transfersController: TransfersController) {
    this.router = Router();
    this.transfersController = transfersController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/getAll', this.transfersController.getAll);
    this.router.delete('/:id', this.transfersController.delete);
    this.router.post('/pause', this.transfersController.pause);
    this.router.post('/reload', this.transfersController.reload);
    this.router.post('/restart', this.transfersController.restart);
  }
}

export default TransfersRouter;
