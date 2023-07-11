import { Schema } from 'mongoose';

import { ApiKeyPlacement } from '../../enums/api-key-placement.enum';

export interface IApiKey {
  key: string;
  value: string;
  placement: ApiKeyPlacement;
}

export const ApiKeySchema = new Schema<IApiKey>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    placement: {
      type: String,
      enum: Object.values(ApiKeyPlacement),
      required: true
    }
  },
  {
    _id: false
  }
);
