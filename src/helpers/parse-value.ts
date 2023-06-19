import { FeatureType } from '../modules/features/enums/feature-type.enum';
import { IFeature } from '../modules/features/feature.schema';

export function parseValue(feature: IFeature, value: any) {
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
