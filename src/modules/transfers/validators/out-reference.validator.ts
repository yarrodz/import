import Joi from 'joi';

export const OutReferenceValidator = Joi.object({
  id: Joi.number().required(),
  _d: Joi.string().valid('out').required()
});
