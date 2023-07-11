import Joi from 'joi';

import { RequestPaginationPlacement } from '../../enums/request-paginanation-placement';

export const RequestPaginationValidator = Joi.object({
  placement: Joi.string().valid(...Object.values(RequestPaginationPlacement)),
  offsetParameter: Joi.string().optional().allow(null),
  limitParameter: Joi.string().optional().allow(null)
});
