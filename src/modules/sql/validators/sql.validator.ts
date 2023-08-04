import Joi from 'joi';

import { SqlConnectionValidator } from './sql-connection.validator';
import { SqlDialect } from '../enums/sql-dialect.enum';
import { SqlImportTarget } from '../enums/sql-import-target.enum';

export const SqlValidator = Joi.object({
  dialect: Joi.string().valid(...Object.values(SqlDialect)),
  connection: SqlConnectionValidator.required(),
  target: Joi.string().valid(...Object.values(SqlImportTarget)),
  table: Joi.string().optional().allow(null),
  select: Joi.string().optional().allow(null),
  limit: Joi.number().required()
});
