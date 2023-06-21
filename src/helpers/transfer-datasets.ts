import { CreateDatasetInput } from '../modules/datasets/inputs/create-dataset.input';
import * as DatasetsRepository from '../modules/datasets/datasets.repository';
import * as recordsService from '../modules/records/records.service';

export async function transferDatasets(
  datasets: CreateDatasetInput[]
) {
  try {
    await Promise.all(
      datasets.map(async (datasetInput) => {
        const dataset = await DatasetsRepository.findByImportAndSourceDatasetId(
          datasetInput.impt.toString(),
          datasetInput.sourceDatasetId
        );

        if (!dataset) {
          await DatasetsRepository.create(datasetInput);
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
