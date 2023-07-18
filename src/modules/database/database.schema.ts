import { Schema } from 'mongoose';

import {
  DatabaseConnectionSchema,
  IDatabaseConnection
} from './sub-schemas/database-connection.schema';

export interface IDatabase {
  connection: IDatabaseConnection;
  table?: string;
  customSelect?: string;
  limit: number;
}

export const DatabaseSchema = new Schema<IDatabase>(
  {
    connection: { type: DatabaseConnectionSchema, required: true },
    table: { type: String, required: false },
    customSelect: { type: String, required: false },
    limit: { type: Number, required: true }
  },
  {
    _id: false
  }
);
