import { Server as IO } from 'socket.io';

import DatasetsRepository from '../datasets/datasets.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IDataset } from '../datasets/dataset.interface';
import { IImportDocument } from '../imports/import.schema';
import { IFeature } from '../features/feature.schema';
import { FeatureType } from '../features/enums/feature-type.enum';
import { IField } from '../imports/sub-schemas/field.schema';
import resolvePath from '../../utils/resolve-path/resolve-path';

class TransferStepHelper {
  private io: IO;
  private datasetsRepository: DatasetsRepository;
  private importProcessesRepository: ImportProcessesRepository;

  constructor(
    io: IO,
    datasetsRepository: DatasetsRepository,
    importProcessesRepository: ImportProcessesRepository
  ) {
    this.io = io;
    this.datasetsRepository = datasetsRepository;
    this.importProcessesRepository = importProcessesRepository;
  }

  public async transferStep(
    impt: IImportDocument,
    processId: string,
    datasets: object[],
    idColumn: string,
    cursor?: string
  ) {
    const transormedDatasets = await this.transformDatasets(
      impt,
      processId,
      datasets,
      idColumn
    );

    await this.insertDatasets(transormedDatasets);

    const updatedProcess = await this.importProcessesRepository.update(
      processId,
      {
        attempts: 0,
        errorMessage: null,
        cursor,
        $inc: {
          processedDatasetsCount: datasets.length,
          transferedDatasetsCount: transormedDatasets.length
        }
      }
    );

    this.io.to(processId.toString()).emit('importProcess', updatedProcess);
  }

  private async transformDatasets(
    impt: IImportDocument,
    processId: string,
    retrievedDatasets: object[],
    idColumn: string
  ) {
    const importId = impt._id;
    const unitId = impt.unit;
    const fields = impt.fields;

    const datasets = [];
    retrievedDatasets.forEach(async (retrievedDataset) => {
      try {
        const sourceDatasetId = retrievedDataset[idColumn];
        if (sourceDatasetId === null) {
          throw new Error('The id field contains a null value');
        }

        const records = this.transformRecords(fields, retrievedDataset);
        const dataset = {
          unit: unitId,
          import: importId,
          sourceDatasetId: sourceDatasetId,
          records
        };

        datasets.push(dataset);
      } catch (error) {
        await this.importProcessesRepository.update(processId, {
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

  private transformRecords(fields: IField[], sourceDataset: object) {
    const records = [];
    fields.forEach(({ feature, source }) => {
      const featureId = feature._id;
      const value = resolvePath(sourceDataset, source);
      const parsedValue = this.parseValue(feature, value);

      const record = {
        value: parsedValue,
        feature: featureId
      };
      records.push(record);
    });
    return records;
  }

  private parseValue(feature: IFeature, value: any) {
    try {
      switch (feature.type) {
        case FeatureType.TIME:
        case FeatureType.TEXT:
        case FeatureType.LONG_TEXT:
          return String(value);
        case FeatureType.DATE:
        case FeatureType.DATETIME:
          return new Date(value);
        case FeatureType.BOOLEAN:
          return Boolean(value);
        case FeatureType.NUMBER:
          return Number(value);
        default:
          break;
      }
    } catch (error) {
      throw new Error(`Error while parsing record value: ${error.message}`);
    }
  }

  private async insertDatasets(datasets: IDataset[]) {
    try {
      await Promise.all(
        datasets.map(async (dataset) => {
          const existingDataset =
            await this.datasetsRepository.findByImportAndSourceDatasetIds(
              dataset.import,
              dataset.sourceDatasetId
            );

          if (!existingDataset) {
            await this.datasetsRepository.create(dataset);
          } else {
            await this.datasetsRepository.update(existingDataset._id, dataset);
          }
        })
      );
    } catch (error) {
      throw new Error(`Error while transfer datasets: ${error.message}`);
    }
  }
}

export default TransferStepHelper;
