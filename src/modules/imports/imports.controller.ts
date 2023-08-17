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
    const input = req.body;
    const responseHandler = await this.importsService.create(input);
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const input = req.body;
    const responseHandler = await this.importsService.update(input);
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

  import = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importsService.import(req, id);
    responseHandler.send(res);
  };
}

export default ImportsController;
