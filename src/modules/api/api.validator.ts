import Joi from 'joi';
import { RequestMethod } from './enums/request-method.enum';
import { RequestAuthValidator } from './sub-validators/api-sub-validators/request-auth.validator';
import { RequestPaginationValidator } from './sub-validators/api-sub-validators/request-paination.validator';
import { RequestResponseType } from './enums/request-response-type.enum';
import { TransferType } from '../transfer/enums/transfer-type.enum';

export const apiValidator = Joi.object({
  method: Joi.string()
    .valid(...Object.values(RequestMethod))
    .required(),
  url: Joi.string().required(),
  auth: RequestAuthValidator.optional().allow(null),
  headers: Joi.object().optional().allow(null),
  params: Joi.object().optional().allow(null),
  body: Joi.object().optional().allow(null),
  // body: RequestBodyValidator.optional().allow(null),
  transferType: Joi.string()
    .valid(...Object.values(TransferType))
    .required(),
  paginationOptions: RequestPaginationValidator.optional().allow(null),
  responseType: Joi.string()
    .valid(...Object.values(RequestResponseType))
    .required(),
  datasetsPath: Joi.string().required()
});
