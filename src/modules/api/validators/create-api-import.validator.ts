import Joi from 'joi';

import { ProcessType } from '../../processes/process.type.enum';
import { Source } from '../../imports/enums/source.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import { PaginationOptionsValidator } from './pagination-options.validator';
import { RequestValidator } from './request.validator';

export const CreateApiImportValidator = Joi.object({
  name: Joi.string().min(1).max(128).required(),
  idKey: Joi.string().min(1).max(128).required(),

  type: Joi.string().valid(ProcessType.IMPORT).required(),
  source: Joi.string().valid(Source.API).required(),

  limitRequestsPerSecond: Joi.number().integer().min(1).max(16).required(),

  retryOptions: Joi.object({
    maxAttempts: Joi.number().integer().min(1).max(16).required(),
    attemptTimeDelay: Joi.number().integer().min(1000).max(28800000).required(),
  }).required(),

  request: RequestValidator.required(),
  transferMethod: Joi.string().valid(...Object.values(TransferMethod)).required(),
  paginationOptions: PaginationOptionsValidator.required(),

  idPath: Joi.string().required(),
  datasetsPath: Joi.string().required(),

  fields: Joi.object().optional(),
});


