import { Model } from 'mongoose';
import { IRecord } from '../modules/records/record.interface';
import { IDataset } from '../modules/datasets/dataset.interface';
import DatasetsRepository from '../modules/datasets/datasets.repository';
import ImportsRepository from '../modules/imports/imports.repository';
import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import RecordsRepository from '../modules/records/records.repository';
import ImportModel from '../modules/imports/import.schema';
import ImportProcessModel from '../modules/import-processes/import-process.schema';

export default function setupRepositories(
  recordModel: Model<IRecord>,
  datasetModel: Model<IDataset>
): {
  datasetsRepository: DatasetsRepository;
  importsRepository: ImportsRepository;
  importProcessesRepository: ImportProcessesRepository;
} {
  const recordsRepository = new RecordsRepository(recordModel);
  const datasetsRepository = new DatasetsRepository(
    datasetModel,
    recordsRepository
  );
  const importsRepository = new ImportsRepository(ImportModel);
  const importProcessesRepository = new ImportProcessesRepository(
    ImportProcessModel
  );

  return {
    datasetsRepository,
    importsRepository,
    importProcessesRepository
  };
}
