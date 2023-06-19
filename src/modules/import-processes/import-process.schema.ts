import mongoose, { Schema, Document, Types } from 'mongoose';

import { ImportStatus } from './enums/import-status.enum';

export interface IImportProcess {
  unit: Types.ObjectId | string;
  import: Types.ObjectId | string;
  status: ImportStatus;
  datasetsCount: number;
  processedDatasetsCount: number;
  transferedDatasetsCount: number;
  log: string[];
  attempts: number;
  errorMessage?: string;
}

export interface IImportProcessDocument extends IImportProcess, Document {}

export const ImportProcessSchema = new Schema<IImportProcess>({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  import: { type: mongoose.Schema.Types.ObjectId, ref: 'Import' },
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

export default mongoose.model<IImportProcessDocument>(
  'ImportProcess',
  ImportProcessSchema
);
