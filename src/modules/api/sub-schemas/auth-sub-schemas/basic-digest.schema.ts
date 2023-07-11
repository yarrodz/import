import { Schema } from 'mongoose';

export interface IBasicDigest {
  username: string;
  password: string;
}

export const BasicDigestSchema = new Schema<IBasicDigest>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true }
  },
  {
    _id: false
  }
);
