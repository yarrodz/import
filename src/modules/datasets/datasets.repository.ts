import Dataset from './dataset.schema';
import Record from '../records/record.schema';
import { CreateDatasetInput } from './inputs/create-dataset.input';

export async function create(input: CreateDatasetInput) {
  const { unit, impt, sourceDatasetId, records } = input;
  const dataset = await Dataset.create({ unit, import: impt, sourceDatasetId });

  const recordsToCreate = records.map((record) => {
    return {
      dataset: dataset._id,
      ...record
    };
  });

  const createdRecords = await Record.insertMany(recordsToCreate);
  await dataset.updateOne({ records: createdRecords });
}

export async function findByImportAndSourceDatasetId(
  importId: string,
  sourceDatasetId: string
) {
  return await Dataset.findOne({
    import: importId,
    sourceDatasetId
  });
}
