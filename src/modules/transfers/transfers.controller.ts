import { Request, Response } from 'express';

import TransfersService from './transfers.service';

export class TransfersController {
  private transfersService: TransfersService;

  constructor(transfersService: TransfersService) {
    this.transfersService = transfersService;
  }

  getAll = async (req: Request, res: Response) => {
    const { select, sortings } = req.body;
    const responseHandler = await this.transfersService.getAll(
      select,
      sortings
    );
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.transfersService.delete(Number(id));
    responseHandler.send(res);
  };

  pause = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.transfersService.pause(id);
    responseHandler.send(res);
  };

  reload = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.transfersService.reload(req, id);
    responseHandler.send(res);
  };

  retry = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.transfersService.retry(req, id);
    responseHandler.send(res);
  };
}

export default TransfersController;
