import { IImport } from '../modules/imports/import.schema';
import { IColumn } from '../intefaces/column.interface';
import { SqlConnection } from '../utils/sql/sql.connection';
import { dialectMap } from '../utils/sql/dialect.map';
import {
  createSelectColumnsQuery,
  createSelectDataQuery,
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

    sqlConnection = new SqlConnection({
      ...connection,
      dialect: dialectMap[source]
    });
    await sqlConnection.connect();

    let columns: IColumn[] = [];
    if (table) {
      try {
        columns = await selectColumnsFromSchema(sqlConnection, table, source);
        //Maybe user have no access to information schema then we receive columns from dataset
      } catch (error) {
        const query = createSelectDataQuery(source, table, idColumn, 0, 1);
        columns = await selectColumnsFromDataset(sqlConnection, query);
      }
    } else {
      const query = paginateQuery(source, customSelect, idColumn, 0, 1);
      columns = await selectColumnsFromDataset(sqlConnection, query);
    }
    sqlConnection.disconnect();
    return columns;
  } catch (error) {
    sqlConnection.disconnect();
    throw error;
  }
}

async function selectColumnsFromSchema(
  sqlConnection: SqlConnection,
  table: string,
  dialect: string
): Promise<IColumn[]> {
  const columnsQuery = createSelectColumnsQuery(table, dialect);
  const retrievedColumns = await sqlConnection.queryRows(columnsQuery);
  return retrievedColumns.map((column) => {
    return {
      name: column['column_name'] || column['COLUMN_NAME'],
      type: column['data_type'] || column['DATA_TYPE']
    };
  });
}

async function selectColumnsFromDataset(
  sqlConnection: SqlConnection,
  query: string
): Promise<IColumn[]> {
  const retrievedDatasets = await sqlConnection.queryRows(query);
  if (retrievedDatasets.length === 0) {
    throw new Error('Error while quering columns, table is empty');
  }
  const dataset = retrievedDatasets[0];
  return Object.entries(dataset).map(([key, value]) => {
    return {
      name: key,
      type: typeof value
    };
  });
}
