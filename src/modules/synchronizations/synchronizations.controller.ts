import { Request, Response } from 'express';

import SynchronizationsService from './synchronizations.service';

class SynchronizationsController {
  private synchronizationsService: SynchronizationsService;

  constructor(synchronizationsService: SynchronizationsService) {
    this.synchronizationsService = synchronizationsService;
  }

  findAll = async (req: Request, res: Response) => {
    const unitId = req.params.unitId;
    const responseHandler = await this.synchronizationsService.findAll(unitId);
    responseHandler.send(res);
  };

  create = async (req: Request, res: Response) => {
    const impt = req.body;
    const responseHandler = await this.synchronizationsService.create(
      req,
      impt
    );
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const id = req.body.id;
    const impt = req.body.impt;
    const responseHandler = await this.synchronizationsService.update(
      req,
      id,
      impt
    );
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.synchronizationsService.delete(id);
    responseHandler.send(res);
  };

  getColumns = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.synchronizationsService.getColumns(
      req,
      id
    );
    responseHandler.send(res);
  };

  setImportFields = async (req: Request, res: Response) => {
    const id = req.body.id;
    const fields = req.body.fields;
    const responseHandler = await this.synchronizationsService.setImportFields(
      id,
      fields
    );
    responseHandler.send(res);
  };

  import = async (req: Request, res: Response) => {
    const id = req.body.id;
    const responseHandler = await this.synchronizationsService.import(req, id);
    responseHandler.send(res);
  };
}

export default SynchronizationsController;
