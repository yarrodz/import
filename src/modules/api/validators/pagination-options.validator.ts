import Joi from 'joi';

import { RequestPaginationPlacement } from '../enums/request-pagination-placement';

export const PaginationOptionsValidator = Joi.object({
  placement: Joi.string().valid(...Object.values(RequestPaginationPlacement)).optional(),
  cursorKey: Joi.string().min(1).max(128).optional().allow(null),
  cursorPath: Joi.string().min(1).max(128).optional().allow(null),
  offsetKey: Joi.string().min(1).max(128).optional().allow(null),
  limitkey: Joi.string().min(1).max(128).optional(),
  limitValue: Joi.number().integer().min(1).max(1024).optional(),
});
