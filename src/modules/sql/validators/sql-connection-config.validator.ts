import Joi from 'joi';

import { SqlDialect } from '../enums/sql-dialect.enum';

export const SqlConnectionConfigValidator = Joi.object({
  dialect: Joi.string().valid(...Object.values(SqlDialect)),
  username: Joi.string().required(),
  password: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  database: Joi.string().required()
});
