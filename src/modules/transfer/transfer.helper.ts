import { Server as IO } from 'socket.io';

import IPaginationFunction from './interfaces/pagination-function.interface';
import { IDataset } from '../datasets/dataset.interface';
import DatasetsRepository from '../datasets/datasets.repository';
import { FeatureType } from '../features/enums/feature-type.enum';
import { IFeature } from '../features/feature.schema';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportDocument } from '../imports/import.schema';
import { IField } from '../imports/sub-schemas/field.schema';

class TransferHelper {
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

  public async paginationTransfer(
    impt: IImportDocument,
    processId: string,
    idColumn: string,
    datasetsCount: number,
    offset: number,
    limit: number,
    paginationFunction: IPaginationFunction,
    ...paginationFunctionParams: any[]
  ) {
    while (offset < datasetsCount) {
      const refreshedProcess = await this.importProcessesRepository.findById(
        processId
      );
      if (refreshedProcess.status === ImportStatus.PAUSED) {
        this.io
          .to(processId.toString())
          .emit('importProcess', refreshedProcess);
        return;
      }

      const retrievedDatasets = await paginationFunction(
        offset,
        limit,
        ...paginationFunctionParams
      );

      const transormedDatasets = await this.transformDatasets(
        impt,
        processId,
        retrievedDatasets,
        idColumn
      );

      await this.insertDatasets(transormedDatasets);

      const updatedProcess = await this.importProcessesRepository.update(
        processId,
        {
          attempts: 0,
          errorMessage: null,
          $inc: {
            processedDatasetsCount: retrievedDatasets.length,
            transferedDatasetsCount: transormedDatasets.length
          }
        }
      );

      this.io.to(processId.toString()).emit('importProcess', updatedProcess);
      offset += limit;
    }

    const completedProcess = await this.importProcessesRepository.update(
      processId,
      {
        status: ImportStatus.COMPLETED,
        errorMessage: null
      }
    );
    this.io.to(processId.toString()).emit('importProcess', completedProcess);
  }

  public async chunkTransfer(
    chunkedDatasets: object[][],
    impt: IImportDocument,
    processId: string,
    idColumn: string
  ) {
    while (chunkedDatasets.length) {
      const refreshedProcess = await this.importProcessesRepository.findById(
        processId
      );
      if (refreshedProcess.status === ImportStatus.PAUSED) {
        this.io
          .to(processId.toString())
          .emit('importProcess', refreshedProcess);
        return;
      }
      const chunk = chunkedDatasets.shift();
      const transormedDatasets = await this.transformDatasets(
        impt,
        processId,
        chunk,
        idColumn
      );

      await this.insertDatasets(transormedDatasets);

      const updatedProcess = await this.importProcessesRepository.update(
        processId,
        {
          attempts: 0,
          errorMessage: null,
          $inc: {
            processedDatasetsCount: chunk.length,
            transferedDatasetsCount: transormedDatasets.length
          }
        }
      );
      this.io.to(processId.toString()).emit('importProcess', updatedProcess);
    }

    const completedProcess = await this.importProcessesRepository.update(
      processId,
      {
        status: ImportStatus.COMPLETED,
        errorMessage: null
      }
    );
    this.io.to(processId.toString()).emit('importProcess', completedProcess);
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
      const value = sourceDataset[source];
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

export default TransferHelper;
