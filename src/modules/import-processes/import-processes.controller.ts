import { Request, Response } from 'express';
import ImportsProcessesService from './import-processes.service';

export class ImportProcessesController {
  private importProcessesService: ImportsProcessesService;

  constructor(importsService: ImportsProcessesService) {
    this.importProcessesService = importsService;
  }

  findAll = async (req: Request, res: Response) => {
    const unitId = req.params.unitId;
    const responseHandler = await this.importProcessesService.findAll(unitId);
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.importProcessesService.delete(id);
    responseHandler.send(res);
  };

  pause = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importProcessesService.pause(id);
    responseHandler.send(res);
  };

  reload = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importProcessesService.reload(id);
    responseHandler.send(res);
  };

  retry = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.importProcessesService.retry(id);
    responseHandler.send(res);
  };
}

export default ImportProcessesController;
