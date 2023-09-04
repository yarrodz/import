import { Request, Response } from 'express';

import ImportsService from './imports.service';

class ImportsController {
  private importsService: ImportsService;

  constructor(importsService: ImportsService) {
    this.importsService = importsService;
  }

  getAll = async (req: Request, res: Response) => {
    const { select, sortings } = req.body;
    const responseHandler = await this.importsService.getAll(select, sortings);
    responseHandler.send(res);
  };

  get = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.importsService.get(Number(id));
    responseHandler.send(res);
  };

  create = async (req: Request, res: Response) => {
    const data = req.body.data;
    const getColumns = req.body.getColumns || false;
    const responseHandler = await this.importsService.create(data, getColumns);
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const data = req.body.data;
    const getColumns = req.body.getColumns || false;
    const start = req.body.start || false;
    const responseHandler = await this.importsService.update(
      req,
      data,
      getColumns,
      start
    );
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.importsService.delete(Number(id));
    responseHandler.send(res);
  };

  getColumns = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importsService.getColumns(req, id);
    responseHandler.send(res);
  };

  checkIdColumnUniqueness = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importsService.getColumns(req, id);
    responseHandler.send(res);
  };

  checkImport = async (req: Request, res: Response) => {
    const connection = req.body.connection;
    const impt = req.body.impt;
    const responseHandler = await this.importsService.checkImport(
      req,
      connection,
      impt
    );
    responseHandler.send(res);
  };

  startImport = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importsService.startImport(req, id);
    responseHandler.send(res);
  };
}

export default ImportsController;
