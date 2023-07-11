import { Schema } from 'mongoose';

import {
  DatabaseConnectionSchema,
  IDatabaseConnection
} from './sub-schemas/database-connection.schema';

export interface IDatabase {
  connection: IDatabaseConnection;
  idColumn: string;
  table?: string;
  customSelect?: string;
  datasetsCount?: number;
}

export const DatabaseSchema = new Schema<IDatabase>(
  {
    connection: { type: DatabaseConnectionSchema, required: true },
    idColumn: { type: String, required: true },
    table: { type: String, required: false },
    customSelect: { type: String, required: false },
    datasetsCount: { type: Number, required: false }
  },
  {
    _id: false
  }
);
