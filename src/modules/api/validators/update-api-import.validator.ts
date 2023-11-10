import Joi from 'joi';

import { ProcessType } from '../../processes/enums/process.type.enum';
import { Source } from '../../oauth2/enums/source.enum';
import { TransferMethod } from '../../transfer-processes/enums/transfer-method.enum';
import { PaginationOptionsValidator } from './pagination-options.validator';
import { RequestValidator } from './request.validator';
import { ImportFieldValidator } from '../../transfers/validators/transfer-field.validator';
import { OutReferenceValidator } from '../../transfers/validators/out-reference.validator';

// export const UpdateApiImportValidator = Joi.object({
//   id: Joi.number().integer().required(),

//   name: Joi.string().min(1).max(128).optional(),
//   idKey: Joi.string().min(1).max(128).optional(),

//   type: Joi.string().valid(ProcessType.IMPORT).optional(),
//   source: Joi.string().valid(Source.API).optional(),

//   limitRequestsPerSecond: Joi.number().integer().min(1).max(16).optional(),

//   retryOptions: Joi.object({
//     maxAttempts: Joi.number().integer().min(1).max(16).required(),
//     attemptTimeDelay: Joi.number().integer().min(1000).max(28800000).required()
//   }).optional(),

//   request: RequestValidator.optional(),
//   transferMethod: Joi.string()
//     .valid(...Object.values(TransferMethod))
//     .optional(),
//   paginationOptions: PaginationOptionsValidator.optional().allow(null),

//   idPath: Joi.string().optional(),
//   datasetsPath: Joi.string().optional(),

//   fields: Joi.array().items(ImportFieldValidator).optional(),

//   __: Joi.object({
//     inUnit: OutReferenceValidator.required(),
//     hasConnection: OutReferenceValidator.required()
//   }).optional()
// });

export const UpdateApiImportValidator = Joi.object();
