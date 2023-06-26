import { Schema, Types } from 'mongoose';

import { FeatureType } from './enums/feature-type.enum';

export interface IFeature {
  _id: Types.ObjectId | string;
  name: string;
  type: FeatureType;
}

export const FeatureSchema = new Schema<IFeature>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(FeatureType),
    required: true
  }
});
