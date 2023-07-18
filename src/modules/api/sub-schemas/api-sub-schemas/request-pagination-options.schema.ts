import { Schema } from 'mongoose';

import { RequestPaginationPlacement } from '../../enums/request-paginanation-placement';

export interface IRequestPaginationOptions {
  placement: RequestPaginationPlacement;
  cursorParameter?: string;
  cursorParameterPath?: string;
  offsetParameter?: string;
  limitParameter: string;
  limitValue: number;
}

export const RequestPaginationOptionsSchema =
  new Schema<IRequestPaginationOptions>(
    {
      placement: {
        type: String,
        enum: Object.values(RequestPaginationPlacement),
        required: true
      },
      cursorParameter: { type: String, required: false },
      cursorParameterPath: { type: String, required: false },
      offsetParameter: { type: String, required: false },
      limitParameter: { type: String, required: true },
      limitValue: { type: Number, required: true }
    },
    {
      _id: false
    }
  );
