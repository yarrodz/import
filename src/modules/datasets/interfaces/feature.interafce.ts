import { FeatureType } from '../enums/feature-type.enum';

export interface Feature {
  id: number;
  name: string;
  type: FeatureType;
}
