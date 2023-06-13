import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';

import ImportsService from './imports.service';
import { ConnectInput } from './inputs/connect.input';
import { FieldInput } from './inputs/field.input';

export class ImportsController {
  async connect(req: Request, res: Response) {
    const connectInput = plainToInstance(ConnectInput, req.body);
    const responseHandler = await ImportsService.connect(connectInput);
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

  async pause(req: Request, res: Response) {
    const processId = req.body.processId;
    const responseHandler = await ImportsService.pause(processId);
    responseHandler.send(res);
  }

  async reload(req: Request, res: Response) {
    const processId = req.body.processId;
    const responseHandler = await ImportsService.reload(processId);
    responseHandler.send(res);
  }

  async retry(req: Request, res: Response) {
    const processId = req.body.processId;
    const responseHandler = await ImportsService.retry(processId);
    responseHandler.send(res);
  }
}

export default new ImportsController();
