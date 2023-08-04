// import Joi from 'joi';

// import { RequestAuthType } from '../../enums/api-connection-type.enum';
// import { ApiKeyValidator } from '../connection-validators/api-key.validator';
// import { BasicDigestValidator } from '../connection-validators/basic-digest.validator';
// import { BearerValidator } from '../connection-validators/bearer.validator';
// import { OAuth2Validator } from '../../../oauth2/oauth2.validator';

// export const RequestAuthValidator = Joi.object({
//   type: Joi.string()
//     .valid(...Object.values(RequestAuthType))
//     .required(),
//   apiKey: ApiKeyValidator.optional().allow(null),
//   basicDigest: BasicDigestValidator.optional().allow(null),
//   bearer: BearerValidator.optional().allow(null),
//   oauth2: OAuth2Validator.optional().allow(null)
// });
