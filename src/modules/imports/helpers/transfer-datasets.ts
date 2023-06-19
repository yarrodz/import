import { CreateDatasetInput } from '../../datasets/inputs/create-dataset.input';
import * as DatasetsRepository from '../../datasets/datasets.repository';
import * as recordsService from '../../records/records.service';

export async function transferDatasets(
  importId: string,
  datasets: CreateDatasetInput[]
) {
  try {
    await Promise.all(
      datasets.map(async (datasetInput) => {
        const dataset = await DatasetsRepository.findByImportAndSourceDatasetId(
          importId,
          datasetInput.sourceDatasetId
        );

        if (!dataset) {
          await DatasetsRepository.create({ impt: importId, ...datasetInput });
        } else {
          const records = datasetInput.records.map((record) => {
            return {
              ...record,
              dataset: dataset._id
            };
          });
          await recordsService.archiveRecords(dataset._id);
          const createdRecords = await recordsService.createMany(records);
          await dataset.updateOne({ records: createdRecords });
        }
      })
    );
  } catch (error) {
    throw new Error(`Error while transfer datasets: ${error.message}`);
  }
}
