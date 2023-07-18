import Joi from 'joi';

import { DatabaseConnectionValidator } from './sub-validators/database-connection.validator';

export const databaseValidator = Joi.object({
  connection: DatabaseConnectionValidator.required(),
  table: Joi.string().optional().allow(null),
  customSelect: Joi.string().optional().allow(null),
  limit: Joi.number().required()
});
