import { FeatureType } from '../modules/features/enums/feature-type.enum';
import { IFeature } from '../modules/features/feature.schema';

export function parseValue(feature: IFeature, value: any) {
  try {
    let parsedValue;
    switch (feature.type) {
      case FeatureType.TIME:
      case FeatureType.TEXT:
      case FeatureType.LONG_TEXT:
        parsedValue = String(value);
        break;
      case FeatureType.DATE:
      case FeatureType.DATETIME:
        parsedValue = new Date(value);
        break;
      case FeatureType.BOOLEAN:
        parsedValue = Boolean(value);
        break;    
      case FeatureType.NUMBER:
        parsedValue = Number(value);
        break;
      default:
        break;
    }
    return parsedValue;
  } catch (error) {
    throw new Error(`Error while parsing record value: ${error.message}`);
  }
}
