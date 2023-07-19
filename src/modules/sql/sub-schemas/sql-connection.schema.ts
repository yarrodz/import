import { Schema } from 'mongoose';

export interface ISqlConnection {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
}

export const SqlConnectionSchema = new Schema<ISqlConnection>(
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
