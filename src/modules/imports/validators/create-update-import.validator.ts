import Joi from 'joi';

import { ImportSource } from '../enums/import-source.enum';
import { RequestMethod } from '../enums/request-method.enum';
import { RequestBodyType } from '../enums/request-body.enum';
import { ResponseType } from '../enums/response-type.enum';

const databaseValidator = Joi.object({
  connection: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
    database: Joi.string().required()
  }).required(),
  table: Joi.string().optional().allow(null),
  idColumn: Joi.string().required(),
  customSelect: Joi.string().optional().allow(null),
  datasetsCount: Joi.number().integer().optional().allow(null)
});

const apiValidator = Joi.object({
  requestConfig: Joi.object({
    method: Joi.string()
      .valid(...Object.values(RequestMethod))
      .required(),
    url: Joi.string().required(),
    headers: Joi.object().optional().allow(null),
    params: Joi.object().optional().allow(null),
    bodyType: Joi.string()
      .valid(...Object.values(RequestBodyType))
      .required(),
    body: Joi.object().optional().allow(null),
    responseType: Joi.string()
      .valid(...Object.values(ResponseType))
      .required()
  }).required(),
  idColumn: Joi.string().required(),
  path: Joi.string().required()
});

export const CreateUpdateImportValidator = Joi.object({
  unit: Joi.string().length(24).required(),
  source: Joi.string().valid(...Object.values(ImportSource)),
  database: databaseValidator.optional().allow(null),
  api: apiValidator.optional().allow(null)
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
