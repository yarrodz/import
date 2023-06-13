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

import { ImportSource } from '../enums/import-source.enum';
import { RequestMethod } from '../enums/request-method.enum';

export class ConnectInput {
  @IsString()
  @Length(24, 24)
  unit: string;

  @IsIn(Object.values(ImportSource))
  source: ImportSource;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DatabaseInput)
  database?: DatabaseInput;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ApiInput)
  api?: ApiInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImapInput)
  imap?: ImapInput;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  idColumn: string;
}

export class DatabaseInput {
  config: any;

  @IsOptional()
  @IsString()
  @Length(1, 128)
  table?: string;

  @IsOptional()
  @IsString()
  @Length(1, 4096)
  customSelect?: string;
}

export class ApiInput {
  @ValidateNested({ each: true })
  @Type(() => ApiConfigInput)
  config: ApiConfigInput;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  path?: string;
}

export class ApiConfigInput {
  @IsIn(Object.values(RequestMethod))
  method: RequestMethod;

  @IsString()
  @Length(1, 512)
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

export class ImapInput {
  @ValidateNested()
  @Type(() => ImapConigInput)
  config: ImapConigInput;
}

export class ImapConigInput {
  @IsString()
  @Length(1, 128)
  user: string;

  @IsString()
  @Length(1, 128)
  password: string;

  @IsString()
  @Length(1, 128)
  host: string;

  @IsInt()
  port: number;

  @IsBoolean()
  tls: boolean;
}
