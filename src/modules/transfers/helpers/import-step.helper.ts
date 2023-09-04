import { Server as IO } from 'socket.io';
import { load } from 'cheerio';

import Transfer from '../interfaces/transfer.interface';
import resolvePath from '../../../utils/resolve-path/resolve-path';
import Feature from '../../features/feature.interafce';
import { FeatureType } from '../../features/feature-type.enum';
import Dataset from '../../datasets/dataset.interface';
import ImportField from '../../imports/interfaces/import-field.interface';
import TransfersRepository from '../transfers.repository';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import DatasetsRepository from '../../datasets/datasets.repository';
import EmailImport from '../../email/interfaces/email-import.interace';

class ImportStepHelper {
  private io: IO;
  private transfersRepository: TransfersRepository;
  private datasetsRepository: DatasetsRepository;

  constructor(
    io: IO,
    transfersRepository: TransfersRepository,
    datasetsRepository: DatasetsRepository
  ) {
    this.io = io;
    this.transfersRepository = transfersRepository;
    this.datasetsRepository = datasetsRepository;
  }

  public async step(
    impt: SqlImport | ApiImport | EmailImport,
    transfer: Transfer,
    datasets: object[],
    cursor?: string
  ) {
    const { id: transferId } = transfer;

    const transormedDatasets = await this.transformDatasets(impt, datasets);

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
    impt: SqlImport | ApiImport | EmailImport,
    datasets: object[]
  ) {
    const { id: importId, idKey } = impt;
    const { fields } = impt;
    const unit = impt.__.inUnit;
    const { id: unitId } = unit;

    const transformedDatasets = [];
    datasets.forEach(async (dataset) => {
      // const sourceId = resolvePath(dataset, idKey);
      const sourceId = dataset[idKey];
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
        case FeatureType.JSON:
          return JSON.stringify(value);
        case FeatureType.HTML:
          const loadedHtml = load(value);
          return loadedHtml.text();
        case FeatureType.DATE:
        case FeatureType.DATETIME:
          return new Date(value);
        case FeatureType.BOOLEAN:
          return Boolean(value);
        case FeatureType.NUMBER:
          return Number(value);
        default: {
          return null;
        }
      }
    } catch (error) {
      return null;
    }
  }

  private async insertDatasets(datasets: Dataset[]) {
    try {
      await this.datasetsRepository.bulkSave(datasets);
    } catch (error) {
      throw new Error(`Error while insert datasets: ${error.message}.`);
    }
  }
}

export default ImportStepHelper;
