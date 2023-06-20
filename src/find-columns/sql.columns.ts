import { IImport } from '../modules/imports/import.schema';
import { IColumn } from '../modules/imports/intefaces/column.interface';
import { SqlConnection } from '../utils/sql/sql.connection';
import { dialectMap } from '../utils/sql/dialect.map';
import {
  createSelectColumnsQuery,
  paginateQuery
} from '../utils/sql/sql.query-builder';

export async function findSqlTableColumns(
  impt: Omit<IImport, 'fields'>
): Promise<IColumn[]> {
  let sqlConnection: SqlConnection;
  try {
    const source = impt.source;
    const connection = impt.database.connection;
    const idColumn = impt.database.idColumn;
    const table = impt.database.table;
    const customSelect = impt.database.customSelect;

    sqlConnection = new SqlConnection(
      connection.database,
      connection.username,
      connection.password,
      {
        host: connection.host,
        port: connection.port,
        dialect: dialectMap[source]
      }
    );

    await sqlConnection.connect();

    let columns: IColumn[] = [];
    if (table) {
      const columnsQuery = createSelectColumnsQuery(table, source);
      const retrievedColumns = await sqlConnection.queryRows(columnsQuery);
      columns = retrievedColumns.map((column) => {
        return {
          name: Object.values(column)[0],
          type: Object.values(column)[1]
        };
      });
    } else {
      const paginatedQuery = paginateQuery(
        source,
        customSelect,
        idColumn,
        0,
        1
      );
      const retrievedDatasets = await sqlConnection.queryRows(paginatedQuery);
      if (retrievedDatasets.length === 0) {
        throw new Error('Error while quering columns, table is empty');
      }
      const dataset = retrievedDatasets[0];
      columns = Object.entries(dataset).map(([key, value]) => {
        return {
          name: key,
          type: typeof value
        };
      });
    }
    sqlConnection.disconnect();
    return columns;
  } catch (error) {
    sqlConnection.disconnect();
    throw error;
  }
}
