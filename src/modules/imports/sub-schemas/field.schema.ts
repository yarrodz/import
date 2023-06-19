import { Schema } from 'mongoose';

import { FeatureSchema, IFeature } from '../../features/feature.schema';

export interface IField {
  feature: IFeature;
  source: string;
}

export const FieldSchema = new Schema<IField>(
  {
    feature: { type: FeatureSchema, required: true },
    source: { type: String, required: true }
  },
  {
    _id: false
  }
);
