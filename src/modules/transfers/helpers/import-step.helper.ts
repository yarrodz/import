import { Server as IO } from 'socket.io';

import { iFrameDataset, iFrameTransfer } from 'iframe-ai';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import dbClient from '../../../utils/db-client/db-client';
import Transfer from '../interfaces/transfer.interface';
import resolvePath from '../../../utils/resolve-path/resolve-path';
import Feature from '../../features/feature.interafce';
import { FeatureType } from '../../features/feature-type.enum';
import Dataset from '../../datasets/dataset.interface';
import ImportField from '../../synchronizations/interfaces/import-field.interface';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';
import sleep from '../../../utils/sleep/sleep';

class ImportStepHelper {
  private io: IO;

  constructor(io: IO) {
    this.io = io;
  }

  public async importStep(
    synchronization: Synchronization,
    transfer: Transfer,
    datasets: object[],
    cursor?: string
  ) {
    const { id: transferId } = transfer;

    const transormedDatasets = await this.transformDatasets(
      synchronization,
      transfer,
      datasets
    );

    // console.log('transormedDatasets: ', transormedDatasets);
    console.log('datasets.length: ', datasets.length);
    console.log('transormedDatasets.length: ', transormedDatasets.length);

    await this.insertDatasets(transormedDatasets);

    console.log('after');

    console.log(
      'transfer.processedDatasetsCount: ',
      transfer.processedDatasetsCount
    );
    let updatedTransfer = await new iFrameTransfer(
      dbClient,
      {
        attempts: 0,
        errorMessage: null,
        cursor,
        processedDatasetsCount:
          transfer.processedDatasetsCount + datasets.length,
        transferedDatasetsCount:
          transfer.processedDatasetsCount + transormedDatasets.length
      },
      transferId
    ).save();
    updatedTransfer = transformIFrameInstance(updatedTransfer);

    // this.io.to(transferId.toString()).emit('importProcess', updatedTransfer);
  }

  private async transformDatasets(
    synchronization: Synchronization,
    transfer: Transfer,
    datasets: object[]
  ) {
    const {
      id: synchronizationId,
      unit,
      import: impt,
      idParameterName
    } = synchronization;
    const { id: transferId } = transfer;
    const { fields } = impt;
    const { id: unitId } = unit;

    const transformedDatasets = [];
    datasets.forEach(async (dataset) => {
      try {
        const sourceId = resolvePath(dataset, idParameterName);
        if (sourceId === null) {
          throw new Error('The id field contains a null value');
        }

        const records = this.transformRecords(fields, dataset);
        const transformedDataset = {
          unitId,
          synchronizationId,
          sourceId,
          records
        };

        transformedDatasets.push(transformedDataset);
      } catch (error) {
        // await new iFrameTransfer(
        //   dbClient,
        //   {
        //     log: transfer.log.push(
        //       `Cannot parse dataset: '${JSON.stringify(dataset)}', Error: '${
        //         error.message
        //       }'`
        //     )
        //   },
        //   transferId
        // ).save();
      }
    });

    return transformedDatasets;
  }

  private transformRecords(fields: ImportField[], dataset: object) {
    const records = [];
    fields.forEach(({ feature, source }) => {
      const { id: featureId } = feature;
      const value = dataset[source];
      const parsedValue = this.parseValue(feature, value);

      const record = {
        value: parsedValue,
        featureId
      };
      records.push(record);
    });
    return records;
  }

  private parseValue(value: any, feature: Feature) {
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

  private async insertDatasets(datasets: Dataset[]) {
    try {
      // await Promise.all(
      //   datasets.map(async (dataset) => {
      //     const existingDataset = await new iFrameDataset(dbClient).load(id)
      //       await this.datasetsRepository.findByImportAndSourceDatasetIds(
      //         dataset.import,
      //         dataset.sourceDatasetId
      //       );

      //     if (!existingDataset) {
      //       await this.datasetsRepository.create(dataset);
      //     } else {
      //       await this.datasetsRepository.update(existingDataset._id, dataset);
      //     }
      //   })
      // );

      // const createdDatasets = await new iFrameDataset(dbClient).bulkInsert(
      //   datasets
      // );
      await sleep(2000);
      let createdDatasets = 1000;
      console.log('createdDatasets: ', createdDatasets);
    } catch (error) {
      throw new Error(`Error while insert datasets: ${error.message}.`);
    }
  }
}

export default ImportStepHelper;
