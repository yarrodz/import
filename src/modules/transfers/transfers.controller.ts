import { Request, Response } from 'express';

import { TransfersService } from './transfers.service';

export class TransfersController {
  constructor(
    private transfersService: TransfersService
  ) {}

  getAll = async (req: Request, res: Response) => {
    const { select, sortings } = req.body;
    const responseHandler = await this.transfersService.getAll(select, sortings);
    responseHandler.send(res);
  };

  get = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.transfersService.get(Number(id));
    responseHandler.send(res);
  };

  create = async (req: Request, res: Response) => {
    const data = req.body.data;
    const getColumns = req.body.getColumns || false;
    const responseHandler = await this.transfersService.create(data, getColumns);
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const data = req.body.data;
    const getColumns = req.body.getColumns || false;
    const start = req.body.start || false;
    const responseHandler = await this.transfersService.update(
      req,
      data,
      getColumns,
      start
    );
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.transfersService.delete(Number(id));
    responseHandler.send(res);
  };

  getColumns = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.transfersService.getColumns(req, id);
    responseHandler.send(res);
  };

  checkIdColumnUniqueness = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.transfersService.getColumns(req, id);
    responseHandler.send(res);
  };

  checkTransfer = async (req: Request, res: Response) => {
    const connection = req.body.connection;
    const impt = req.body.impt;
    const responseHandler = await this.transfersService.checkTransfer(
      req,
      connection,
      impt
    );
    responseHandler.send(res);
  };

  startTransfer = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.transfersService.startTransfer(req, id);
    responseHandler.send(res);
  };
}
