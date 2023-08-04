import { SqlDialect } from '../enums/sql-dialect.enum';

export default interface SqlConnection {
  id: string;
  dialect: SqlDialect;
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
}
