import ConnectionReference from '../../connections/interfafces/connection.reference.interface';
import { Source } from '../../imports/enums/source.enum';
import { SqlDialect } from '../enums/sql-dialect.enum';

export interface SqlConnectionConfig {
  dialect: SqlDialect;
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
}

export default interface SqlConnection {
  id: number;

  name: string;
  source: Source.SQL;

  config: SqlConnectionConfig;

  __: ConnectionReference;
}
