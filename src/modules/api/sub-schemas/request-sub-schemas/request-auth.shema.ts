import { Schema } from 'mongoose';

import { RequestAuthType } from '../../enums/request-auth-type.enum';
import { ApiKeySchema, IApiKey } from '../auth-sub-schemas/api-key.schema';
import {
  BasicDigestSchema,
  IBasicDigest
} from '../auth-sub-schemas/basic-digest.schema';
import { BearerSchema, IBearer } from '../auth-sub-schemas/bearer.schema';
import { IOAuth2, OAuth2Schema } from '../../../oauth2/oauth2.schema';

export interface IRequestAuth {
  type: RequestAuthType;
  apiKey?: IApiKey;
  basicDigest?: IBasicDigest;
  bearer?: IBearer;
  oauth2?: IOAuth2;
}

export const RequestAuthSchema = new Schema<IRequestAuth>(
  {
    type: {
      type: String,
      enum: Object.values(RequestAuthType),
      required: true
    },
    apiKey: { type: ApiKeySchema, required: false },
    basicDigest: { type: BasicDigestSchema, required: false },
    bearer: { type: BearerSchema, required: false },
    oauth2: { type: OAuth2Schema, required: false }
  },
  {
    _id: false
  }
);
