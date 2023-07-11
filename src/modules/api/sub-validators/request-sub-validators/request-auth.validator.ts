import Joi from 'joi';

import { RequestAuthType } from '../../enums/request-auth-type.enum';
import { ApiKeyValidator } from '../request-auth-sub-validators/api-key.validator';
import { BasicDigestValidator } from '../request-auth-sub-validators/basic-digest.validator';
import { BearerValidator } from '../request-auth-sub-validators/bearer.validator';
import { OAuth2Validator } from '../../../oauth2/oauth2.validator';

export const RequestAuthValidator = Joi.object({
  type: Joi.string()
    .valid(...Object.values(RequestAuthType))
    .required(),
  apiKey: ApiKeyValidator.optional().allow(null),
  // apiKey: Joi.object().optional().allow(null),
  basicDigest: BasicDigestValidator.optional().allow(null),
  // basicDigest: Joi.object().optional().allow(null),
  bearer: BearerValidator.optional().allow(null),
  // bearer: Joi.object().optional().allow(null),
  oauth2: OAuth2Validator.optional().allow(null)
  // oauth2: Joi.object().optional().allow(null)
});
