import Joi from 'joi';

import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { ApiKeyValidator } from './connection-validators/api-key.validator';
import { BasicDigestValidator } from './connection-validators/basic-digest.validator';
import { BearerValidator } from './connection-validators/bearer.validator';
import { OAuth2Validator } from '../../oauth2/validators/oauth2.validator';
import { Source } from '../../imports/enums/source.enum';

export const CreateApiConnectionValidator = Joi.object({
    name: Joi.string().min(1).max(128).required(),

    source: Joi.string().valid(Source.API).required(),

    type: Joi.string().valid(...Object.values(ApiConnectionType)).required(),

    apiKey: ApiKeyValidator.optional(),
    basicDigest: BasicDigestValidator.optional(),
    bearer: BearerValidator.optional(),
    oauth2: OAuth2Validator.optional()
});
