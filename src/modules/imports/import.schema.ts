import mongoose, { Schema, Document, Types } from 'mongoose';

import { ImportSource } from './enums/import-source.enum';
import { DatabaseSchema, IDatabase } from '../database/database.schema';
import { FieldSchema, IField } from './sub-schemas/field.schema';
import { ApiSchema, IApi } from '../api/api.schema';
// import { IImap, ImapSchema } from './sub-schemas/imap.schema';

export interface IImport {
  unit: Types.ObjectId | string;
  source: ImportSource;
  database?: IDatabase;
  api?: IApi;
  // imap?: IImap;
  limitRequestsPerSecond: number;
  fields?: IField[];
  idColumn: string;
  datasetsCount?: number;
}

export interface IImportDocument extends IImport, Document {}

const ImportSchema = new Schema<IImport>({
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  source: {
    type: String,
    enum: Object.values(ImportSource),
    required: true
  },
  database: { type: DatabaseSchema, required: false },
  api: { type: ApiSchema, required: false },
  fields: [{ type: FieldSchema }],
  limitRequestsPerSecond: { type: Number, required: false },
  idColumn: { type: String, required: true },
  datasetsCount: { type: Number, required: false }
});

export default mongoose.model<IImportDocument>('Import', ImportSchema);
