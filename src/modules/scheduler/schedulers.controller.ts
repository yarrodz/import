import { Request, Response } from 'express';

import { SchedulersService } from './schedulers.service';

export class SchedulersController {
  private schedulersService: SchedulersService;

  constructor(schedulersService: SchedulersService) {
    this.schedulersService = schedulersService;
  }

  getAll = async (req: Request, res: Response) => {
    const { select, sortings } = req.body;

    const responseHandler = await this.schedulersService.getAll(
      select,
      sortings
    );
    responseHandler.send(res);
  };

  get = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.schedulersService.get(Number(id));
    responseHandler.send(res);
  };

  create = async (req: Request, res: Response) => {
    const input = req.body;
    const responseHandler = await this.schedulersService.create(input);
    responseHandler.send(res);
  };

  update = async (req: Request, res: Response) => {
    const input = req.body;
    const responseHandler = await this.schedulersService.update(input);
    responseHandler.send(res);
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseHandler = await this.schedulersService.delete(Number(id));
    responseHandler.send(res);
  };
}
