import Joi from 'joi';

export const OAuth2Validator = Joi.object({
  client_id: Joi.string().required(),
  client_secret: Joi.string().optional().allow(null),
  auth_uri: Joi.string().required(),
  token_uri: Joi.string().required(),
  scope: Joi.string().optional().allow(null),
  use_code_verifier: Joi.bool().required()
});
