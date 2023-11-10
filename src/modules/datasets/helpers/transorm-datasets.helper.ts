import { Process } from '../../processes/process.type';
import { Feature } from '../interfaces/feature.interafce';
import { FeatureType } from '../enums/feature-type.enum';
import { ImportField } from '../../transfers/interfaces/import-field.interface';
import { resolvePath } from '../../../utils/resolve-path/resolve-path';
import { TransferDataset } from '../interfaces/transfer-dataset.interace';
import { TransferRecord } from '../interfaces/transfer-record.interface';

export class TransformDatasetsHelper {
  public static transformDatasets(
    datasets: object[],
    process: Process
  ): any {
    const { id: importId, idKey, fields } = process;
    const unit = process.__.inUnit;
    const { id: unitId } = unit;

    const transferDatasets = [];
    datasets.forEach(async (dataset) => {
      // const sourceId = resolvePath(dataset, idKey);
      const sourceId = dataset[idKey];

      if (sourceId == null) {
        throw new Error('The id field contains a null value');
      }

      const records = TransformDatasetsHelper.toTransferRecords(dataset, fields);
      const transferDataset: TransferDataset = {
        unitId,
        importId,
        sourceId,
        records
      };

      transferDatasets.push(transferDataset);
    });

    return transferDatasets;
  }

  private static toTransferRecords(
    dataset: object,
    fields: ImportField[]
  ): TransferRecord[] {
    const records = [];

    for (const { feature, source } of fields) {
      const { id: featureId } = feature;

      const value = resolvePath(dataset, source);
      const parsedValue = this.parseValue(value, feature);

      const record = {
        value: parsedValue,
        featureId
      };

      records.push(record);
    }
    // fields.forEach(({ feature, source }) => {
    // });

    return records;
  }

  private parseValue(value: any, feature: Feature) {
    const cases = {
      [FeatureType.TIME]: String(value),
      [FeatureType.TEXT]: String(value),
      [FeatureType.LONG_TEXT]: String(value),
      [FeatureType.JSON]: value,
      [FeatureType.AI]: value,
      [FeatureType.DATE]: new Date(value),
      [FeatureType.DATETIME]: new Date(value),
      [FeatureType.BOOLEAN]: Boolean(value),
      [FeatureType.NUMBER]: Number(value),
    }

    try {
      const { type } = feature;
      return cases[type];
    } catch (error) {
      throw new Error(`Error while parsing record value: ${error}`);
    }
  }
}


// parseValue swith case variant
// private parseValue(value: any, feature: Feature) {
//   try {
//     switch (feature.type) {
//       case FeatureType.TIME:
//       case FeatureType.TEXT:
//       case FeatureType.LONG_TEXT: {
//         return String(value);
//       }
//       case FeatureType.JSON: {
//         return value;
//       }
//       case FeatureType.DATE:
//       case FeatureType.DATETIME:
//         return new Date(value);
//       case FeatureType.BOOLEAN:
//         return Boolean(value);
//       case FeatureType.NUMBER:
//         return Number(value);
//       default: {
//         return null;
//       }
//     }
//   } catch (error) {
//     return null;
//   }
// }
