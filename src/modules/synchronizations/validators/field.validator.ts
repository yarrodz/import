import Joi from 'joi';

import { FeatureType } from '../../features/feature-type.enum';

export const FieldValidator = Joi.object({
  feature: Joi.object({
    _id: Joi.string().length(24).required(),
    name: Joi.string().required(),
    type: Joi.string().valid(...Object.values(FeatureType))
  }).required(),
  source: Joi.string().required()
});
