import { Process } from '../../processes/process.type';
import { Feature } from '../interfaces/feature.interafce';
import { FeatureType } from '../enums/feature-type.enum';
import { ImportField } from '../../imports/interfaces/import-field.interface';
import { resolvePath } from '../../../utils/resolve-path/resolve-path';

export class TransformDatasetsHelper {
  public transform(datasets: object[], process: Process) {
    const { id: importId, idKey } = process;
    const { fields } = process;
    const unit = process.__.inUnit;
    const { id: unitId } = unit;

    const transformedDatasets = [];
    datasets.forEach(async (dataset) => {
      // const sourceId = resolvePath(dataset, idKey);
      const sourceId = dataset[idKey];
      if (sourceId === null) {
        return;
        // throw new Error('The id field contains a null value');
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
        case FeatureType.LONG_TEXT: {
          return String(value);
        }
        case FeatureType.JSON: {
          return value;
        }
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
}
