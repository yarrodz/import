import Dataset from '../datasets/dataset.interface';
import Feature from '../features/feature.interafce';

export default interface Record {
  value: any;
  archived: boolean;
  feature: Feature;
  dataset: Dataset;
}
