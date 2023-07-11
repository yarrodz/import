import Joi from 'joi';

import { RequestMethod } from '../enums/request-method.enum';
import { RequestAuthValidator } from './request-sub-validators/request-auth.validator';
// import { RequestBodyValidator } from './request-sub-validators/request-body.validator';
import { RequestPaginationValidator } from './request-sub-validators/request-paination.validator';
// import { RequestResponseType } from '../enums/request-response-type.enum';

export const requestValidator = Joi.object({
  method: Joi.string()
    .valid(...Object.values(RequestMethod))
    .required(),
  url: Joi.string().required(),
  auth: RequestAuthValidator.optional().allow(null),
  headers: Joi.object().optional().allow(null),
  params: Joi.object().optional().allow(null),
  body: Joi.object().optional().allow(null),
  // body: RequestBodyValidator.optional().allow(null),
  painationOptions: RequestPaginationValidator.optional().allow(null),
  // responseType: Joi.string()
  //   .valid(...Object.values(RequestResponseType))
  //   .required(),
  responsePath: Joi.string().required()
});
