import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRecord {
  value: any;
  archived: boolean;
  feature: Types.ObjectId;
  dataset: Types.ObjectId;
}

export interface IRecordModel extends IRecord, Document {}

export const RecordSchema = new Schema({
  value: { type: Schema.Types.Mixed, required: true },
  archived: { type: Boolean, default: false, index: true },
  feature: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  dataset: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true }
});

export default mongoose.model<IRecord>('Record', RecordSchema);
