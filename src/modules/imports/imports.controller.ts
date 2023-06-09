import { Request, Response } from 'express';

import ImportsService from './imports.service';

export class ImportsController {
  async connect(req: Request, res: Response) {
    const data = req.body;
    const columns = await ImportsService.connect(data);

    res.send(columns);
  }

  async setFields(req: Request, res: Response) {
    const { id, fields } = req.body;
    await ImportsService.setFields(id, fields);

    res.send('ok');
  }

  async start(req: Request, res: Response) {
    const id = req.body.id;
    await ImportsService.start(id);

    res.send('ok');
  }

  async pause(req: Request, res: Response) {
    const processId = req.body.processId;
    await ImportsService.pause(processId);

    res.send('ok');
  }

  async reload(req: Request, res: Response) {
    const processId = req.body.processId;
    await ImportsService.reload(processId);

    res.send('ok');
  }

  async retry(req: Request, res: Response) {
    const processId = req.body.processId;
    await ImportsService.retry(processId);

    res.send('ok');
  }
}

export default new ImportsController();
