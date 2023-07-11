import Joi from 'joi';

export const BasicDigestValidator = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});
