import mongoose, { Document, Schema, Types } from 'mongoose';

import { IRecord, RecordSchema } from '../records/record.schema';

export interface IDataset extends Document {
  unit: Types.ObjectId;
  records: IRecord[];
  import?: Types.ObjectId;
  sourceDatasetId?: string;
}

const DatasetSchema = new Schema<IDataset>({
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  records: [{ type: RecordSchema }],
  import: {
    type: Schema.Types.ObjectId,
    ref: 'Import',
    required: false
  },
  sourceDatasetId: { type: Schema.Types.String, index: true, required: false }
});

export default mongoose.model<IDataset>('Dataset', DatasetSchema);
