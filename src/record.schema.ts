import mongoose, { Schema } from 'mongoose';

import { IRecord } from './modules/records/record.interface';

export const recordSchema = new Schema<IRecord>({
  value: { type: Schema.Types.Mixed, required: true },
  archived: { type: Boolean, default: false, index: true },
  feature: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  dataset: { type: Schema.Types.ObjectId, ref: 'Dataset', required: false }
});

export const recordModel = mongoose.model<IRecord>('Record', recordSchema);
