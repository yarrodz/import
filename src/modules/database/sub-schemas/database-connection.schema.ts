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
