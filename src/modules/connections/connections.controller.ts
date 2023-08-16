import { Request, Response } from 'express';

import ConnectionsService from './connections.service';
import { Source } from '../imports/enums/source.enum';

class ConnectionsController {
  private connectionsService: ConnectionsService;

  constructor(connectionsService: ConnectionsService) {
    this.connectionsService = connectionsService;
  }

  getAll = async (req: Request, res: Response) => {
    let { select, sortings } = req.body;

    const responseHandler = await this.connectionsService.getAll(
      select,
      sortings
    );
    responseHandler.send(res);
  };

  get = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.connectionsService.get(Number(id));
    responseHandler.send(res);
  };

  create = async (req: Request, res: Response) => {
    const input = req.body;
    const responseHandler = await this.connectionsService.create(input);
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const input = req.body;
    const responseHandler = await this.connectionsService.update(input);
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.connectionsService.delete(Number(id));
    responseHandler.send(res);
  };
}

export default ConnectionsController;
