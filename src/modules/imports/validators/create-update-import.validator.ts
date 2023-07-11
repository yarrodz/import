import Joi from 'joi';

import { ImportSource } from '../enums/import-source.enum';
import { databaseValidator } from '../../database/database.validator';
import { apiValidator } from '../../api/api.validator';

export const CreateUpdateImportValidator = Joi.object({
  unit: Joi.string().length(24).required(),
  source: Joi.string().valid(...Object.values(ImportSource)),
  database: databaseValidator.optional().allow(null),
  api: apiValidator.optional().allow(null)
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
