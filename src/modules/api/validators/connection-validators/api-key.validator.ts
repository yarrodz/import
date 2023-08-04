import Joi from 'joi';

import { ApiKeyPlacement } from '../../enums/api-key-placement.enum';

export const ApiKeyValidator = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required(),
  placement: Joi.string()
    .valid(...Object.values(ApiKeyPlacement))
    .required()
});
