import { Connection } from '../../connections/interfaces/connection.inteface';
import { SqlDialect } from '../enums/sql-dialect.enum';

export interface SqlConnection extends Connection {
  config: {
    dialect: SqlDialect;
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
  }
}
