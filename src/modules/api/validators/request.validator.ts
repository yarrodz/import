import Joi from "joi";
import { RequestMethod } from "../enums/request-method.enum";

export const RequestValidator = Joi.object({
  method: Joi.string()
    .valid(...Object.values(RequestMethod))
    .required(),
  url: Joi.string().required(),
  headers: Joi.object().optional().allow(null),
  params: Joi.object().optional().allow(null),
  body: Joi.object().optional().allow(null),
})