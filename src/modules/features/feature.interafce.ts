import { FeatureType } from './feature-type.enum';

export default interface Feature {
  id: number;
  name: string;
  type: FeatureType;
}
