import Joi from 'joi';

import { Source } from '../../imports/enums/source.enum';
import { SqlConnectionConfigValidator } from './sql-connection-config.validator';

export const UpdateApiConnectionValidator = Joi.object({
    id: Joi.number().integer().required(),

    name: Joi.string().min(1).max(128).optional(),

    source: Joi.string().valid(Source.SQL).optional(),

    config: SqlConnectionConfigValidator.optional()
});
