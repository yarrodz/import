import { FeatureType } from '../../features/enums/feature-type.enum';
import { IFeatureModel } from '../../features/feature.schema';

export function parseValue(feature: IFeatureModel, value: any) {
  try {
    let parsedValue;
    switch (feature.type) {
      case FeatureType.TEXT:
        parsedValue = String(value);
        break;
      case FeatureType.NUMBER:
        parsedValue = Number(value);
        break;
      case FeatureType.DATE:
        parsedValue = new Date(value);
        break;
      default:
        break;
    }
    return parsedValue;
  } catch (error) {
    throw new Error(`Error while parsing record value: ${error.message}`);
  }
}
