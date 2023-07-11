import { Schema } from 'mongoose';

import { RequestPaginationPlacement } from '../../enums/request-paginanation-placement';

export interface IRequestPaginationOptions {
  placement?: RequestPaginationPlacement;
  offsetParameter?: string;
  limitParameter?: string;
}

export const RequestPaginationOptionsSchema =
  new Schema<IRequestPaginationOptions>(
    {
      placement: {
        type: String,
        enum: Object.values(RequestPaginationPlacement),
        required: true
      },
      offsetParameter: { type: String, required: true },
      limitParameter: { type: String, required: true }
    },
    {
      _id: false
    }
  );
