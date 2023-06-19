import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';

import ImportsService from './imports.service';
import { CreateImportInput } from './inputs/create-import.input';
import { FieldInput } from './inputs/field.input';

export class ImportsController {
  async findAll(req: Request, res: Response) {
    const unitId = req.params.unitId;
    const responseHandler = await ImportsService.findAll(unitId);
    responseHandler.send(res);
  }

  async create(req: Request, res: Response) {
    const createImportInput = plainToInstance(CreateImportInput, req.body);
    const responseHandler = await ImportsService.create(createImportInput);
    responseHandler.send(res);
  }

  async connect(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsService.connect(id);
    responseHandler.send(res);
  }

  async setFields(req: Request, res: Response) {
    const id = req.body.id;
    const fieldInputs = req.body.fields.map((field) => {
      return plainToInstance(FieldInput, field);
    });
    const responseHandler = await ImportsService.setFields(id, fieldInputs);
    responseHandler.send(res);
  }

  async start(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsService.start(id);
    responseHandler.send(res);
  }
}

export default new ImportsController();
