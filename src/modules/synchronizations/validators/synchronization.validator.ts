import Joi from 'joi';

// import { ImportSource } from './enums/synchronization-source.enum';
// import { SqlValidator } from '../sql/sql.validator';
// import { ApiValidator } from '../api/api-synchronization.validator';

// export const SynchronizationValidator = Joi.object({
//   unit: Joi.string().length(24).required(),
//   source: Joi.string().valid(...Object.values(ImportSource)),
//   sql: SqlValidator.optional().allow(null),
//   api: ApiValidator.optional().allow(null),
//   idColumn: Joi.string().optional().allow(null),
//   datasetsCount: Joi.number().integer().optional().allow(null),
//   limitRequestsPerSecond: Joi.number().optional().allow(null)
// });

export const SynchronizationValidator = Joi.object();
