import Joi from 'joi';

import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { ApiKeyValidator } from './connection-validators/api-key.validator';
import { BasicDigestValidator } from './connection-validators/basic-digest.validator';
import { BearerValidator } from './connection-validators/bearer.validator';
import { OAuth2Validator } from '../../oauth2/validators/oauth2.validator';
import { Source } from '../../imports/enums/source.enum';

export const UpdateApiConnectionValidator = Joi.object({
    id: Joi.number().integer().required(),

    name: Joi.string().min(1).max(128).optional(),

    source: Joi.string().valid(Source.API).optional(),

    type: Joi.string().valid(...Object.values(ApiConnectionType)).optional(),

    apiKey: ApiKeyValidator.optional().allow(null),
    basicDigest: BasicDigestValidator.optional().allow(null),
    bearer: BearerValidator.optional().allow(null),
    oauth2: OAuth2Validator.optional().allow(null)
});
