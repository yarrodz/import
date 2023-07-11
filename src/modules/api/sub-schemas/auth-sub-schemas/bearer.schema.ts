import { Schema } from 'mongoose';

export interface IBearer {
  token: string;
}

export const BearerSchema = new Schema<IBearer>(
  {
    token: { type: String, required: false }
  },
  {
    _id: false
  }
);
