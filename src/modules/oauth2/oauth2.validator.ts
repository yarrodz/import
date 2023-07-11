import Joi from 'joi';

export const OAuth2Validator = Joi.object({
  client_id: Joi.string().required(),
  client_secret: Joi.string().optional().allow(null),
  auth_url: Joi.string().required(),
  token_url: Joi.string().required(),
  use_code_verifier: Joi.bool().required()
});
