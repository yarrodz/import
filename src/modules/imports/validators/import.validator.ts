import Joi from 'joi';

import { ImportSource } from '../enums/import-source.enum';
import { databaseValidator } from '../../database/database.validator';
import { apiValidator } from '../../api/api.validator';

export const ImportValidator = Joi.object({
  unit: Joi.string().length(24).required(),
  source: Joi.string().valid(...Object.values(ImportSource)),
  database: databaseValidator.optional().allow(null),
  api: apiValidator.optional().allow(null),
  idColumn: Joi.string().optional().allow(null),
  datasetsCount: Joi.number().integer().optional().allow(null),
  limitRequestsPerSecond: Joi.number().optional().allow(null)
});

// export class ImapInput implements IImap {
//   @ValidateNested({ each: true })
//   @Type(() => ImapConnectionInput)
//   connection: ImapConnectionInput;
// }

// export class ImapConnectionInput implements IImapConnection {
//   @IsString()
//   user: string;

//   @IsString()
//   password: string;

//   @IsString()
//   host: string;

//   @IsInt()
//   port: number;

//   @IsBoolean()
//   tls: boolean;
// }
