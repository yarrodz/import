import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { IImportModel } from '../import.schema';

import { transformRecords } from './transform-records';

export async function transformDatasets(
  imp: IImportModel,
  importProcess: IImportProcessModel,
  retrievedDatasets: object[],
  idColumn: string
) {
  const unit = imp.unit;
  const fields = imp.fields;

  const datasets = [];
  retrievedDatasets.forEach(async (retrievedDataset) => {
    try {
      const sourceDatasetId = retrievedDataset[idColumn];
      if (sourceDatasetId === null) {
        throw new Error('The id field contains a null value');
      }

      const records = transformRecords(fields, retrievedDataset);

      datasets.push({
        unit,
        import: imp._id,
        sourceDatasetId: sourceDatasetId,
        records
      });
    } catch (error) {
      await importProcess.updateOne({
        $push: {
          log: `Cannot parse dataset: '${JSON.stringify(
            retrievedDataset
          )}', Error: '${error.message}'`
        }
      });
    }
  });

  return datasets;
}
