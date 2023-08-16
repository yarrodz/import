import Joi from 'joi';

import { ProcessType } from '../../processes/process.type.enum';
import { Source } from '../../imports/enums/source.enum';
import { SqlImportTarget } from '../enums/sql-import-target.enum';

export const CreateSqlImportValidator = Joi.object({
  id: Joi.number().integer().required(),
  
  name: Joi.string().min(1).max(128).optional(),
  idKey: Joi.string().min(1).max(128).optional(),

  type: Joi.string().valid(ProcessType.IMPORT).optional(),
  source: Joi.string().valid(Source.SQL).optional(),

  limitRequestsPerSecond: Joi.number().integer().min(1).max(16).optional(),

  retryOptions: Joi.object({
    maxAttempts: Joi.number().integer().min(1).max(16).required(),
    attemptTimeDelay: Joi.number().integer().min(1000).max(28800000).required(),
  }).optional(),

  target: Joi.string().valid(...Object.values(SqlImportTarget)).optional(),
  table: Joi.string().optional().allow(null),
  select: Joi.string().optional().allow(null),
  limit: Joi.number().required(),

  fields: Joi.object().optional(),
});


