import { Request, Response } from 'express';

import ImportsService from './imports.service';

export class ImportsController {
  async findAll(req: Request, res: Response) {
    const unitId = req.params.unitId;
    const responseHandler = await ImportsService.findAll(unitId);
    responseHandler.send(res);
  }

  async create(req: Request, res: Response) {
    const impt = req.body;
    const responseHandler = await ImportsService.create(impt);
    responseHandler.send(res);
  }

  async update(req: Request, res: Response) {
    const id = req.body.id;
    const impt = req.body.impt;
    const responseHandler = await ImportsService.update(id, impt);
    responseHandler.send(res);
  }

  async connect(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsService.connect(id);
    responseHandler.send(res);
  }

  async setFields(req: Request, res: Response) {
    const id = req.body.id;
    const fields = req.body.fields;
    const responseHandler = await ImportsService.setFields(id, fields);
    responseHandler.send(res);
  }

  async start(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsService.start(id);
    responseHandler.send(res);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    const responseHandler = await ImportsService.delete(id);
    responseHandler.send(res);
  }
}

export default new ImportsController();
