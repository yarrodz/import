import { Server as IO } from 'socket.io';

import { IDataset } from '../datasets/dataset.interface';
import DatasetsRepository from '../datasets/datasets.repository';
import { FeatureType } from '../features/enums/feature-type.enum';
import { IFeature } from '../features/feature.schema';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportDocument } from '../imports/import.schema';
import { IField } from '../imports/sub-schemas/field.schema';
import resolvePath from '../../utils/resolve-path/resolve-path';
import ICursorPaginationFunction from './interfaces/cursor-pagination-function.interface';
import ICursorPagination from './interfaces/cursor-pagination.interface';
import IOffsetPagination from './interfaces/offset-pagination.interface';
import IOffsetPaginationFunction from './interfaces/offset-pagination-function.interface';

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

  public async offsetPaginationTransfer(
    impt: IImportDocument,
    processId: string,
    limit: number,
    offsetPaginationFunction: IOffsetPaginationFunction,
    ...offsetPaginationFunctionParams: any[]
  ) {
    const { idColumn, limitRequestsPerSecond } = impt;

    const prosess = await this.importProcessesRepository.findById(processId);
    let { processedDatasetsCount: offset, datasetsCount } = prosess;

    while (offset < datasetsCount) {
      let requestCounter = 0;
      const startDate = new Date();

      while (requestCounter < limitRequestsPerSecond) {
        requestCounter++;
        const refreshedProcess = await this.importProcessesRepository.findById(
          processId
        );
        if (refreshedProcess.status === ImportStatus.PAUSED) {
          this.io
            .to(processId.toString())
            .emit('importProcess', refreshedProcess);
          return;
        }

        const offsetPagination: IOffsetPagination = {
          offset,
          limit
        };
        const datasets = await offsetPaginationFunction(
          offsetPagination,
          ...offsetPaginationFunctionParams
        );

        if(datasets.length === 0) {
          return;
        }

        await this.transferStep(impt, processId, datasets, idColumn);
  
        offset += limit;
      }
      //If step executed faster than second. we have to wait for the remaining time so that there is a second in the sum
      const endDate = new Date();
      const requestsExectionTime = endDate.getTime() - startDate.getTime();
      // console.log('requestsExectionTime: ', requestsExectionTime);
      // console.log('offset: ', offset);
      // console.log('----------------');
    if (requestsExectionTime < 1000) {
        const remainingToSecond = 1000 - requestsExectionTime;
        // console.log('remainingToSecond: ', remainingToSecond);
        await this.sleep(remainingToSecond);
      }
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

  public async cursorPaginationTransfer(
    impt: IImportDocument,
    processId: string,
    limit: number,
    cursorPaginationFunction: ICursorPaginationFunction,
    ...cursorPaginationFunctionParams: any[]
  ) {
    const { idColumn, datasetsCount, limitRequestsPerSecond } = impt;

    const prosess = await this.importProcessesRepository.findById(processId);
    let { processedDatasetsCount } = prosess;
    while (processedDatasetsCount < datasetsCount) {
      let requestCounter = 0;
      const startDate = new Date();

      while (requestCounter < limitRequestsPerSecond) {
        requestCounter++;
        const refreshedProcess = await this.importProcessesRepository.findById(
          processId
        );
        if (refreshedProcess.status === ImportStatus.PAUSED) {
          this.io
            .to(processId.toString())
            .emit('importProcess', refreshedProcess);
          return;
        }

        processedDatasetsCount = refreshedProcess.processedDatasetsCount;

        const cursorPagination: ICursorPagination = {
          cursor: refreshedProcess.cursor,
          limit
        };

        const { cursor, datasets } = await cursorPaginationFunction(
          cursorPagination,
          ...cursorPaginationFunctionParams
        );
        console.log(cursor);

        await this.transferStep(impt, processId, datasets, idColumn, cursor);
        
        if (!cursor || datasets.length === 0) {
          return;
        }
      }
      const endDate = new Date();
      const requestsExectionTime = endDate.getTime() - startDate.getTime();
      console.log('requestsExectionTime: ', requestsExectionTime);
      console.log('----------------');
      // If step executed faster than second. we have to wait for the remaining time so that there is a second in the sum
      if (requestsExectionTime < 1000) {
        const remainingToSecond = 1000 - requestsExectionTime;
        console.log('remainingToSecond: ', remainingToSecond);
        await this.sleep(remainingToSecond);
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
  }

  public async chunkTransfer(
    impt: IImportDocument,
    processId: string,
    chunkedDatasets: object[][]
  ) {
    const { idColumn } = impt;

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
      await this.transferStep(impt, processId, chunk, idColumn);
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

  // public async streamTransfer(
  //   impt: IImportDocument,
  //   processId: string,
  //   idColumn: string,
  //   readable: ReadStream
  // ) {
  //   for await (const chunk of readable) {
  //     const refreshedProcess = await this.importProcessesRepository.findById(
  //       processId
  //     );
  //     if (refreshedProcess.status === ImportStatus.PAUSED) {
  //       this.io
  //         .to(processId.toString())
  //         .emit('importProcess', refreshedProcess);
  //       return;
  //     }

  //     let chunks = chunk.toString().split('][');
  //     let parsedChunks = chunks.map((chunk) => JSON.parse(chunks));
  //     const parsedChunk = parsedChunks[0];

  //     const transormedDatasets = await this.transformDatasets(
  //       impt,
  //       processId,
  //       parsedChunk,
  //       idColumn
  //     );

  //     await this.insertDatasets(transormedDatasets);

  //     const updatedProcess = await this.importProcessesRepository.update(
  //       processId,
  //       {
  //         attempts: 0,
  //         errorMessage: null,
  //         $inc: {
  //           processedDatasetsCount: parsedChunk.length,
  //           transferedDatasetsCount: transormedDatasets.length
  //         }
  //       }
  //     );

  //     this.io.to(processId.toString()).emit('importProcess', updatedProcess);
  //   }
  //   const completedProcess = await this.importProcessesRepository.update(
  //     processId,
  //     {
  //       status: ImportStatus.COMPLETED,
  //       errorMessage: null
  //     }
  //   );
  //   this.io.to(processId.toString()).emit('importProcess', completedProcess);
  // }

  private async transferStep(
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

  private async sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(undefined), time);
    });
  }
}

export default TransferHelper;
