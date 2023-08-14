import { Source } from '../../imports/enums/source.enum';
import { SqlDialect } from '../enums/sql-dialect.enum';
import SqlExport from './sql-export.interface';
import SqlImport from './sql-import.interface';

export interface SqlConnectionConfig {
  dialect: SqlDialect;
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
}

export default interface SqlConnection {
  id: string;

  name: string;
  source: Source.SQL;

  config: SqlConnectionConfig;

  imports?: SqlImport[];
  exports?: SqlExport[];
}
