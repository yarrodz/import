import Joi from 'joi';

export const BearerValidator = Joi.object({
  token: Joi.string().required()
});
