import Joi from 'joi';

import { ImportSource } from '../enums/import-source.enum';
import { DatabaseImportTarget } from '../enums/database-import-target.enum';

const databaseValidator = Joi.object({
  connection: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
    database: Joi.string().required()
  }).required(),
  idColumn: Joi.string().required(),
  target: Joi.string().valid(...Object.values(DatabaseImportTarget)).required(),
  table: Joi.string().allow(null),
  customSelect: Joi.string().allow(null),
  datasetsCount: Joi.number().integer().allow(null)
});

export const CreateUpdateImportValidator = Joi.object({
  unit: Joi.string().length(24).required(),
  source: Joi.string().valid(...Object.values(ImportSource)).required(),
  database: databaseValidator
});

// export class CreateImportInput implements Omit<IImport, 'fields'> {
//   @IsString()
//   @Length(24, 24)
//   unit: string;

//   @IsIn(Object.values(ImportSource))
//   source: ImportSource;

//   @IsOptional()
//   @ValidateNested({ each: true })
//   @Type(() => DatabaseInput)
//   database?: DatabaseInput;

//   @IsOptional()
//   @ValidateNested({ each: true })
//   @Type(() => ApiInput)
//   api?: ApiInput;

//   @IsOptional()
//   @ValidateNested({ each: true })
//   @Type(() => ImapInput)
//   imap?: ImapInput;
// }

// export class DatabaseInput implements IDatabase {
//   @ValidateNested({ each: true })
//   @Type(() => DatabaseConnectionInput)
//   connection: DatabaseConnectionInput;

//   @IsString()
//   idColumn: string;

//   @IsOptional()
//   @IsString()
//   table?: string;

//   @IsOptional()
//   @IsString()
//   customSelect?: string;

//   @IsOptional()
//   @IsInt()
//   datasetsCount?: number;
// }

// export class DatabaseConnectionInput implements IDatabaseConnection {
//   @IsString()
//   username: string;

//   @IsString()
//   password: string;

//   @IsString()
//   database: string;

//   @IsString()
//   host: string;

//   @IsInt()
//   port: number;
// }

// export class ApiInput implements IApi {
//   @ValidateNested({ each: true })
//   @Type(() => ApiRequestConfigInput)
//   requestConfig: ApiRequestConfigInput;

//   @IsString()
//   idColumn: string;

//   @IsString()
//   path: string;
// }

// export class ApiRequestConfigInput implements IApiRequestConfig {
//   @IsIn(Object.values(RequestMethod))
//   method: RequestMethod;

//   @IsString()
//   url: string;

//   @IsOptional()
//   @IsObject()
//   headers?: object;

//   @IsOptional()
//   @IsObject()
//   data?: object;

//   @IsOptional()
//   @IsObject()
//   params?: object;
// }

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
