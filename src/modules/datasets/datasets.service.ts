import Dataset from './dataset.schema';
import Record from '../records/record.schema';
import { CreateDatasetInput } from './inputs/create-dataset.input';

export async function create(input: CreateDatasetInput) {
  const { unit, imp, sourceDatasetId, records } = input;
  const dataset = await Dataset.create({ unit, import: imp, sourceDatasetId });

  const recordsToCreate = records.map((record) => {
    return {
      dataset: dataset._id,
      ...record
    };
  });

  const createdRecords = await Record.insertMany(recordsToCreate);
  await dataset.updateOne({ records: createdRecords });
}

export async function findBySourceDatasetId(id: string) {
  return await Dataset.findOne({
    sourceDatasetId: id
  });
}

// export async function findOne(req: Request, res: Response) {
//     const id = req.params.id;
//     const dataset = await Dataset.findById(id);

//     res.status(200).json(dataset);
// }
