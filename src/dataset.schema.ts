import mongoose, { Schema } from 'mongoose';

import { IDataset } from './modules/datasets/dataset.interface';
import { recordSchema } from './record.schema';

export const datasetSchema = new Schema<IDataset>({
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  records: [{ type: recordSchema }],
  import: {
    type: Schema.Types.ObjectId,
    ref: 'Import',
    required: false
  },
  sourceDatasetId: { type: Schema.Types.String, index: true, required: false }
});

export const datasetModel = mongoose.model<IDataset>('Dataset', datasetSchema);
