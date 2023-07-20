import Joi from 'joi';

import { RequestAuthType } from '../../enums/request-auth-type.enum';
import { ApiKeyValidator } from '../auth-sub-validators/api-key.validator';
import { BasicDigestValidator } from '../auth-sub-validators/basic-digest.validator';
import { BearerValidator } from '../auth-sub-validators/bearer.validator';
import { OAuth2Validator } from '../../../oauth2/oauth2.validator';

export const RequestAuthValidator = Joi.object({
  type: Joi.string()
    .valid(...Object.values(RequestAuthType))
    .required(),
  apiKey: ApiKeyValidator.optional().allow(null),
  basicDigest: BasicDigestValidator.optional().allow(null),
  bearer: BearerValidator.optional().allow(null),
  oauth2: OAuth2Validator.optional().allow(null)
});
