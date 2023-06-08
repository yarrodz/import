import { Request, Response } from 'express';

import Dataset from './dataset.schema';
import Record from '../records/record.schema';

export async function create(req: Request, res: Response) {
  const { unit, records } = req.body;

  const dataset = await Dataset.create({ unit });

  const recordsToCreate = records.map((record) => {
    return {
      dataset: dataset._id,
      ...record
    };
  });

  const createdRecords = await Record.insertMany(recordsToCreate);
  await dataset.updateOne({ records: createdRecords });

  res.status(200).json(dataset);
}

export async function findOne(req: Request, res: Response) {
  const id = req.params.id;
  const dataset = await Dataset.findById(id);

  res.status(200).json(dataset);
}
