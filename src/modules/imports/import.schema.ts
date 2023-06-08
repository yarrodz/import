import mongoose, { Schema, Document, Types } from 'mongoose';

import { ImportSource } from './enums/import-source.enum';
import { DatabaseSchema, IDatabaseModel } from './sub-schemas/database.schema';
import { FieldSchema, IFieldModel } from './sub-schemas/field.schema';
import { ApiSchema, IApiModel } from './sub-schemas/api.schema';
import { IImapModel, ImapSchema } from './sub-schemas/imap.schema';

export interface IImport {
  unit: Types.ObjectId;
  source: ImportSource;
  database?: IDatabaseModel;
  api?: IApiModel;
  imap?: IImapModel;
  fields: IFieldModel[];
  idColumn: string;
}

export interface IImportModel extends IImport, Document {}

const Import = new Schema({
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  source: {
    type: String,
    enum: Object.values(ImportSource),
    required: true
  },
  database: { type: DatabaseSchema, required: false },
  api: { type: ApiSchema, required: false },
  imap: { type: ImapSchema, requred: false },
  fields: [{ type: FieldSchema }],
  idColumn: { type: String, required: false }
});

export default mongoose.model<IImport>('Import', Import);
