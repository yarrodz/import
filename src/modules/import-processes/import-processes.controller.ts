import { Request, Response } from 'express';
import ImportsProcessesService from './import-processes.service';

export class ImportsController {
  async findAll(req: Request, res: Response) {
    const unitId = req.params.unitId;
    const responseHandler = await ImportsProcessesService.findAll(unitId);
    responseHandler.send(res);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    const responseHandler = await ImportsProcessesService.delete(id);
    responseHandler.send(res);
  }

  async pause(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsProcessesService.pause(id);
    responseHandler.send(res);
  }

  async reload(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsProcessesService.reload(id);
    responseHandler.send(res);
  }

  async retry(req: Request, res: Response) {
    const id = req.body.id;
    const responseHandler = await ImportsProcessesService.retry(id);
    responseHandler.send(res);
  }
}

export default new ImportsController();
