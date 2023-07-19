import mongoose, { Schema, Document, Types } from 'mongoose';

import { ImportSource } from './enums/import-source.enum';
import { SqlSchema, ISql } from '../sql/sql.schema';
import { ApiSchema, IApi } from '../api/api.schema';
import { FieldSchema, IField } from './sub-schemas/field.schema';

export interface IImport {
  unit: Types.ObjectId | string;
  source: ImportSource;
  sql?: ISql;
  api?: IApi;
  fields?: IField[];
  limitRequestsPerSecond: number;
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
  sql: { type: SqlSchema, required: false },
  api: { type: ApiSchema, required: false },
  limitRequestsPerSecond: { type: Number, required: false },
  fields: [{ type: FieldSchema }],
  idColumn: { type: String, required: true },
  datasetsCount: { type: Number, required: false }
});

export default mongoose.model<IImportDocument>('Import', ImportSchema);
