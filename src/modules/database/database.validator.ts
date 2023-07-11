import Joi from 'joi';

import { DatabaseConnectionValidator } from './sub-validators/database-connection.validator';

export const databaseValidator = Joi.object({
  connection: DatabaseConnectionValidator.required(),
  table: Joi.string().optional().allow(null),
  idColumn: Joi.string().required(),
  customSelect: Joi.string().optional().allow(null),
  datasetsCount: Joi.number().integer().optional().allow(null)
});
