import { Schema } from 'mongoose';

import { RequestBodyType } from '../../enums/request-body-type.enum';

export interface IRequestBody {
  type: RequestBodyType;
  data: string | object;
}

export const RequestBodySchema = new Schema<IRequestBody>(
  {
    type: {
      type: String,
      enum: Object.values(RequestBodyType),
      required: true
    },
    data: { type: Schema.Types.Mixed, required: false }
  },
  {
    _id: false
  }
);
