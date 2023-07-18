import Joi from 'joi';

import { RequestPaginationPlacement } from '../../enums/request-paginanation-placement';

export const RequestPaginationValidator = Joi.object({
  placement: Joi.string().valid(...Object.values(RequestPaginationPlacement)),
  cursorParameter: Joi.string().optional().allow(null),
  cursorParameterPath: Joi.string().optional().allow(null),
  offsetParameter: Joi.string().optional().allow(null),
  limitParameter: Joi.string(),
  limitValue: Joi.number()
});
