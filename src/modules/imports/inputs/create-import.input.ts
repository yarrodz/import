import {
  IsString,
  Length,
  IsIn,
  IsOptional,
  IsObject,
  ValidateNested,
  IsInt,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

import { IImport } from '../import.schema';
import { IDatabase, IDatabaseConnection } from '../sub-schemas/database.schema';
import { IApi, IApiRequestConfig } from '../sub-schemas/api.schema';
import { IImap, IImapConnection } from '../sub-schemas/imap.schema';
import { ImportSource } from '../enums/import-source.enum';
import { RequestMethod } from '../enums/request-method.enum';

export class CreateImportInput implements Omit<IImport, 'fields'> {
  @IsString()
  @Length(24, 24)
  unit: string;

  @IsIn(Object.values(ImportSource))
  source: ImportSource;

  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseInput)
  database?: DatabaseInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiInput)
  api?: ApiInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImapInput)
  imap?: ImapInput;

  @IsOptional()
  @IsString()
  idColumn: string;
}

export class DatabaseInput implements IDatabase {
  @ValidateNested()
  @Type(() => DatabaseConnectionInput)
  connection: DatabaseConnectionInput;

  @IsString()
  idColumn: string;

  @IsOptional()
  @IsString()
  table?: string;

  @IsOptional()
  @IsString()
  customSelect?: string;

  @IsOptional()
  @IsInt()
  datasetsCount?: number;
}

export class DatabaseConnectionInput implements IDatabaseConnection {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @IsString()
  host: string;

  @IsInt()
  port: number;
}

export class ApiInput implements IApi {
  @ValidateNested()
  @Type(() => ApiRequestConfigInput)
  requestConfig: ApiRequestConfigInput;

  @IsString()
  idColumn: string;

  @IsString()
  path: string;
}

export class ApiRequestConfigInput implements IApiRequestConfig {
  @IsIn(Object.values(RequestMethod))
  method: RequestMethod;

  @IsString()
  url: string;

  @IsOptional()
  @IsObject()
  headers?: object;

  @IsOptional()
  @IsObject()
  data?: object;

  @IsOptional()
  @IsObject()
  params?: object;
}

export class ImapInput implements IImap {
  @ValidateNested()
  @Type(() => ImapConnectionInput)
  connection: ImapConnectionInput;
}

export class ImapConnectionInput implements IImapConnection {
  @IsString()
  user: string;

  @IsString()
  password: string;

  @IsString()
  host: string;

  @IsInt()
  port: number;

  @IsBoolean()
  tls: boolean;
}
