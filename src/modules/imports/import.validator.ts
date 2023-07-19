import Joi from 'joi';

import { ImportSource } from './enums/import-source.enum';
import { SqlValidator } from '../sql/sql.validator';
import { ApiValidator } from '../api/api.validator';

export const ImportValidator = Joi.object({
  unit: Joi.string().length(24).required(),
  source: Joi.string().valid(...Object.values(ImportSource)),
  sql: SqlValidator.optional().allow(null),
  api: ApiValidator.optional().allow(null),
  idColumn: Joi.string().optional().allow(null),
  datasetsCount: Joi.number().integer().optional().allow(null),
  limitRequestsPerSecond: Joi.number().optional().allow(null)
});
