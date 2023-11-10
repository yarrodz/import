import Joi from 'joi';

import { ProcessType } from '../../processes/enums/process.type.enum';
import { Source } from '../../oauth2/enums/source.enum';
import { SqlImportTarget } from '../enums/sql-import-target.enum';
import { ImportFieldValidator } from '../../transfers/validators/transfer-field.validator';
import { OutReferenceValidator } from '../../transfers/validators/out-reference.validator';

// export const CreateSqlImportValidator = Joi.object({
//   name: Joi.string().min(1).max(128).required(),
//   idKey: Joi.string().min(1).max(128).required(),

//   type: Joi.string().valid(ProcessType.IMPORT).required(),
//   source: Joi.string().valid(Source.SQL).required(),

//   limitRequestsPerSecond: Joi.number().integer().min(1).max(16).required(),

//   retryOptions: Joi.object({
//     maxAttempts: Joi.number().integer().min(1).max(16).required(),
//     attemptTimeDelay: Joi.number().integer().min(1000).max(28800000).required()
//   }).required(),

//   target: Joi.string()
//     .valid(...Object.values(SqlImportTarget))
//     .required(),
//   table: Joi.string().optional().allow(null),
//   select: Joi.string().optional().allow(null),
//   limit: Joi.number().required(),

//   fields: Joi.array().items(ImportFieldValidator).optional(),

//   __: Joi.object({
//     inUnit: OutReferenceValidator.required(),
//     hasConnection: OutReferenceValidator.required()
//   }).required()
// });

export const CreateSqlImportValidator = Joi.object();
