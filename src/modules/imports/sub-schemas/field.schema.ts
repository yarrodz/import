import mongoose, { Document, Schema } from 'mongoose';

import { FeatureSchema } from '../../features/feature.schema';

interface IField {
  feature: any;
  source: string;
}

export interface IFieldModel extends IField, Document {}

export const FieldSchema = new Schema({
  feature: { type: FeatureSchema, required: true },
  source: { type: String, required: true }
});

export default mongoose.model<IField>('Field', FieldSchema);
