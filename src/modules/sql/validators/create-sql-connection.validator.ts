import Joi from 'joi';

import { SqlConnectionConfigValidator } from './sql-connection-config.validator';
import { Source } from '../../imports/enums/source.enum';


export const CreateApiConnectionValidator = Joi.object({
    name: Joi.string().min(1).max(128).required(),

    source: Joi.string().valid(Source.SQL).required(),

    config: SqlConnectionConfigValidator.required()

});
