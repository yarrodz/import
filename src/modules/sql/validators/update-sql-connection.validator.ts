import Joi from 'joi';

import { Source } from '../../oauth2/enums/source.enum';
import { SqlConnectionConfigValidator } from './sql-connection-config.validator';
import { OutReferenceValidator } from '../../transfers/validators/out-reference.validator';

// export const UpdateSqlConnectionValidator = Joi.object({
//   id: Joi.number().integer().required(),

//   name: Joi.string().min(1).max(128).optional(),

//   source: Joi.string().valid(Source.SQL).optional(),

//   config: SqlConnectionConfigValidator.optional(),

//   __: Joi.object({
//     inUnit: OutReferenceValidator.required()
//   }).optional()
// });

export const UpdateSqlConnectionValidator = Joi.object();
