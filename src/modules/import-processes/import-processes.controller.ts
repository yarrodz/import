import { Request, Response } from 'express';
import ImportsProcessesService from './import-processes.service';

export class ImportsController {
  async findAll(req: Request, res: Response) {
    const unitId = req.params.unitId;
    const responseHandler = await ImportsProcessesService.findAll(unitId);
    responseHandler.send(res);
  }

  async pause(req: Request, res: Response) {
    const processId = req.body.processId;
    const responseHandler = await ImportsProcessesService.pause(processId);
    responseHandler.send(res);
  }

  async reload(req: Request, res: Response) {
    const processId = req.body.processId;
    const responseHandler = await ImportsProcessesService.reload(processId);
    responseHandler.send(res);
  }

  async retry(req: Request, res: Response) {
    const processId = req.body.processId;
    const responseHandler = await ImportsProcessesService.retry(processId);
    responseHandler.send(res);
  }
}

export default new ImportsController();
