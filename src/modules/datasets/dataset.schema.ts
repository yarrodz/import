import mongoose, { Document, Schema, Types } from 'mongoose';
import { RecordSchema } from '../records/record.schema';

export interface IDataset {
  unit: Types.ObjectId;
  syncronization?: Types.ObjectId;
  sourceDatasetId?: string;
}

export interface IDatasetModel extends IDataset, Document {}

const DatasetSchema = new Schema({
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  records: [{ type: RecordSchema }],
  syncronization: {
    type: Schema.Types.ObjectId,
    ref: 'Syncronization',
    required: false
  },
  sourceDatasetId: { type: Schema.Types.String, index: true, required: false }
});

export default mongoose.model<IDataset>('Dataset', DatasetSchema);
