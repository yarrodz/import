import { SqlConnection } from "../../../utils/sql/sql.connection";

export interface IPaginationFunction {
  (sqlConnection: SqlConnection, offset: number, limit: number, ...params: any[]): Promise<object[]>;
}
