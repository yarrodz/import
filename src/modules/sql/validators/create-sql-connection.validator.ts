import Joi from 'joi';

import { SqlConnectionConfigValidator } from './sql-connection-config.validator';
import { Source } from '../../oauth2/enums/source.enum';
import { OutReferenceValidator } from '../../transfers/validators/out-reference.validator';

// export const CreateSqlConnectionValidator = Joi.object({
//   name: Joi.string().min(1).max(128).required(),

//   source: Joi.string().valid(Source.SQL).required(),

//   config: SqlConnectionConfigValidator.required(),

//   __: Joi.object({
//     inUnit: OutReferenceValidator.required()
//   }).required()
// });

export const CreateSqlConnectionValidator = Joi.object();
