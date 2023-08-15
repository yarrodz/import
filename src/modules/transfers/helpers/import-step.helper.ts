import { Server as IO } from 'socket.io';

import iFrameDataset from '../../datasets/iFrameDataset';
import Transfer from '../interfaces/transfer.interface';
import resolvePath from '../../../utils/resolve-path/resolve-path';
import Feature from '../../features/feature.interafce';
import { FeatureType } from '../../features/feature-type.enum';
import Dataset from '../../datasets/dataset.interface';
import ImportField from '../../imports/interfaces/import-field.interface';
import TransfersRepository from '../transfers.repository';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import dbClient from '../../..';

class ImportStepHelper {
  private io: IO;
  private transfersRepository: TransfersRepository;

  constructor(io: IO) {
    this.io = io;
    this.transfersRepository = new TransfersRepository();
  }

  public async step(
    impt: SqlImport | ApiImport,
    transfer: Transfer,
    datasets: object[],
    cursor?: string
  ) {
    const { id: transferId } = transfer;

    const transormedDatasets = await this.transformDatasets(
      impt,
      transfer,
      datasets
    );

    await this.insertDatasets(transormedDatasets);

    const updatedTransfer = await this.transfersRepository.update({
      id: transferId,
      cursor,
      offset: transfer.offset + datasets.length,
      transferedDatasetsCount:
        transfer.transferedDatasetsCount + transormedDatasets.length,
      retryAttempts: 0
    });

    this.io.to(String(transferId)).emit('transfer', updatedTransfer);
  }

  private async transformDatasets(
    impt: SqlImport | ApiImport,
    transfer: Transfer,
    datasets: object[]
  ) {
    const { id: importId, idKey } = impt;
    let { id: transferId, log } = transfer;
    const { fields } = impt;
    const unit = impt.__.inUnit[0];
    const { id: unitId } = unit;

    const transformedDatasets = [];
    datasets.forEach(async (dataset) => {
      try {
        const sourceId = resolvePath(dataset, idKey);
        if (sourceId === null) {
          throw new Error('The id field contains a null value');
        }

        const records = this.transformRecords(dataset, fields);
        const transformedDataset = {
          unitId,
          importId,
          sourceId,
          records
        };

        transformedDatasets.push(transformedDataset);
      } catch (error) {
        log.push(
          `Cannot parse dataset: '${JSON.stringify(dataset)}', Error: '${
            error.message
          }'`
        );

        await this.transfersRepository.update({
          id: transferId,
          log
        });
      }
    });

    return transformedDatasets;
  }

  private transformRecords(dataset: object, fields: ImportField[]) {
    const records = [];
    fields.forEach(({ feature, source }) => {
      const { id: featureId } = feature;
      const value = resolvePath(dataset, source);
      const parsedValue = this.parseValue(value, feature);

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
      await new iFrameDataset(dbClient).bulkSave(datasets);
    } catch (error) {
      throw new Error(`Error while insert datasets: ${error.message}.`);
    }
  }
}

export default ImportStepHelper;
