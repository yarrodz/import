import { Schema } from 'mongoose';

import {
  ISqlConnection,
  SqlConnectionSchema
} from './sub-schemas/sql-connection.schema';
import { SqlDialect } from './enums/sql-dialect.enum';
import { SqlImportTarget } from './enums/sql-import-target.enum';

export interface ISql {
  dialect: SqlDialect;
  connection: ISqlConnection;
  target: SqlImportTarget;
  table?: string;
  select?: string;
  limit: number;
}

export const SqlSchema = new Schema<ISql>(
  {
    dialect: {
      type: String,
      enum: Object.values(SqlDialect),
      required: true
    },
    target: {
      type: String,
      enum: Object.values(SqlImportTarget),
      required: true
    },
    connection: { type: SqlConnectionSchema, required: true },
    table: { type: String, required: false },
    select: { type: String, required: false },
    limit: { type: Number, required: true }
  },
  {
    _id: false
  }
);
