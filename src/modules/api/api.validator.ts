import Joi from 'joi';

import { requestValidator } from './sub-validators/request.validator';
import { TransferType } from '../transfer/enums/transfer-type.enum';

export const apiValidator = Joi.object({
  request: requestValidator.required(),
  transferType: Joi.string()
    .valid(...Object.values(TransferType))
    .required(),
  limitPerSecond: Joi.number().required(),
  idColumn: Joi.string().required(),
  datasetsCount: Joi.number().optional().allow(null)
});
