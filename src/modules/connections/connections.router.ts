import { Router } from 'express';

import ConnectionsController from './connections.controller';

class ConnectionsRouter {
  public router: Router;
  private connectionsController: ConnectionsController;

  constructor() {
    this.router = Router();
    this.connectionsController = new ConnectionsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get('/', this.connectionsController.getAll);
    this.router.get('/:id', this.connectionsController.get);
    this.router.post('/', this.connectionsController.create);
    this.router.patch('/', this.connectionsController.update);
    this.router.delete('/:id', this.connectionsController.delete);
  }
}

export default ConnectionsRouter;
