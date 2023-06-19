import { Schema } from 'mongoose';

export interface IDatabaseConnection {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
}

export const DatabaseConnectionSchema = new Schema<IDatabaseConnection>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    database: { type: String, required: true },
    host: { type: String, required: true },
    port: { type: Number, required: true }
  },
  {
    _id: false
  }
);

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
