import ImportProcessesRepository from '../../import-processes/import-processes.repository';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import { IImportDocument } from '../import.schema';
import { transformRecords } from './transform-records';

export async function transformDatasets(
  impt: IImportDocument,
  process: IImportProcessDocument,
  retrievedDatasets: object[],
  idColumn: string
) {
  const unit = impt.unit;
  const fields = impt.fields;

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
        import: impt._id,
        sourceDatasetId: sourceDatasetId,
        records
      });
    } catch (error) {
      const log = `Cannot parse dataset: '${JSON.stringify(
        retrievedDataset
      )}', Error: '${error.message}'`;
      const logs = process.log;
      logs.push(log);
      await ImportProcessesRepository.update(process.id, {
        log: logs
      });
    }
  });

  return datasets;
}
