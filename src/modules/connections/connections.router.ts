import { Router } from 'express';

import ConnectionsController from './connections.controller';

class ConnectionsRouter {
  public router: Router;
  private connectionsController: ConnectionsController;

  constructor(connectionsController: ConnectionsController) {
    this.router = Router();
    this.connectionsController = connectionsController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/getAll', this.connectionsController.getAll);
    this.router.get('/:id', this.connectionsController.get);
    this.router.post('/', this.connectionsController.create);
    this.router.patch('/', this.connectionsController.update);
    this.router.delete('/:id', this.connectionsController.delete);
    this.router.post('/check', this.connectionsController.check);
  }
}

export default ConnectionsRouter;
