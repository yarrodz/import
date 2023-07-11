import Joi from 'joi';

export const DatabaseConnectionValidator = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  database: Joi.string().required()
});
