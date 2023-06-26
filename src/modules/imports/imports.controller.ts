import { Request, Response } from 'express';

import ImportsService from './imports.service';

class ImportsController {
  private importsService: ImportsService;

  constructor(importsService: ImportsService) {
    this.importsService = importsService;
  }

  findAll = async (req: Request, res: Response) => {
    const unitId = req.params.unitId;
    const responseHandler = await this.importsService.findAll(unitId);
    responseHandler.send(res);
  };

  create = async (req: Request, res: Response) => {
    const impt = req.body;
    const responseHandler = await this.importsService.create(impt);
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const id = req.body.id;
    const impt = req.body.impt;
    const responseHandler = await this.importsService.update(id, impt);
    responseHandler.send(res);
  };

  connect = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importsService.connect(id);
    responseHandler.send(res);
  };

  setFields = async (req: Request, res: Response) => {
    const id = req.body.id;
    const fields = req.body.fields;
    const responseHandler = await this.importsService.setFields(id, fields);
    responseHandler.send(res);
  };

  start = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importsService.start(id);
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.importsService.delete(id);
    responseHandler.send(res);
  };
}

export default ImportsController;
