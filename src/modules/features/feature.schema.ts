import mongoose, { Schema, Document } from 'mongoose';

import { FeatureType } from './enums/feature-type.enum';

export interface IFeature {
  name: string;
  type: FeatureType;
}

export interface IFeatureModel extends IFeature, Document {}

export const FeatureSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(FeatureType),
    required: true
  }
});

export default mongoose.model<IFeature>('Feature', FeatureSchema);
