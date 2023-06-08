import mongoose, { Schema, Document, Types } from 'mongoose';

import { ImportStatus } from './enums/import-status.enum';

export interface IImportProcess {
  import: Types.ObjectId;
  status: ImportStatus;
  datasetsCount: number;
  processedDatasetsCount: number;
  transferedDatasetsCount: number;
  log: string[];
  attempts: number;
  errorMessage?: string;
}

export interface IImportProcessModel extends IImportProcess, Document {}

export const ImportProcessSchema = new Schema({
  import: { type: mongoose.Schema.Types.ObjectId, ref: 'Synchronization' },
  status: {
    type: String,
    enum: Object.values(ImportStatus),
    default: ImportStatus.PENDING
  },
  datasetsCount: { type: Number, default: 0 },
  processedDatasetsCount: { type: Number, default: 0 },
  transferedDatasetsCount: { type: Number, default: 0 },
  log: [{ type: String }],
  attempts: { type: Number, default: 0 },
  errorMessage: { type: String, required: false }
});

export default mongoose.model<IImportProcess>(
  'ImportProcess',
  ImportProcessSchema
);
