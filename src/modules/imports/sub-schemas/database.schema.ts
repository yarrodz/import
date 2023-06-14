import mongoose, { Document, Schema } from 'mongoose';

interface IDatabase {
  config: any;
  table?: string;
  customSelect?: string;
  datasetsCount?: number;
}

export interface IDatabaseModel extends IDatabase, Document {}

export const DatabaseSchema = new Schema({
  config: { type: Schema.Types.Mixed, required: true },
  table: { type: String, required: false },
  customSelect: { type: String, required: false },
  datasetsCount: { type: Number, required: false }
});

export default mongoose.model<IDatabase>('Database', DatabaseSchema);
