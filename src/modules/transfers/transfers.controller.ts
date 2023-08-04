import { Request, Response } from 'express';

import TransfersService from './transfers.service';

export class TransfersController {
  private transfersService: TransfersService;

  constructor(importsService: TransfersService) {
    this.transfersService = importsService;
  }

  findAll = async (req: Request, res: Response) => {
    const unitId = req.params.unitId;
    const responseHandler = await this.transfersService.findAll(unitId);
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.transfersService.delete(id);
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
