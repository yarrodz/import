import Joi from 'joi';

import { FeatureType } from '../../features/feature-type.enum';

export const ImportFieldValidator = Joi.object({
  feature: Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().required(),
    type: Joi.string()
      .valid(...Object.values(FeatureType))
      .required()
  }).required(),
  source: Joi.string().required()
});
