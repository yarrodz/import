import { Request, Response } from 'express';

import * as importsService from './imports.service';

export async function connect(req: Request, res: Response) {
  const data = req.body;
  const columns = await importsService.connect(data);

  res.send(columns);
}

export async function setFields(req: Request, res: Response) {
  const { importId, fields } = req.body;
  await importsService.setFields(importId, fields);

  res.send('ok');
}

export async function start(req: Request, res: Response) {
  const importId = req.body.importId;
  await importsService.start(importId);

  res.send('ok');
}

export async function pause(req: Request, res: Response) {
  const importProcessId = req.body.importProcessId;
  await importsService.pause(importProcessId);

  res.send('ok');
}

export async function reload(req: Request, res: Response) {
  const importProcessId = req.body.importProcessId;
  await importsService.reload(importProcessId);

  res.send('ok');
}

export async function retry(req: Request, res: Response) {
  const importProcessId = req.body.importProcessId;
  await importsService.retry(importProcessId);

  res.send('ok');
}
