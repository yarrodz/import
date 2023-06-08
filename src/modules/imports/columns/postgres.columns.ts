import { PostgresConnection } from '../../../utils/postgres/postgres.connection';

import { IImportModel } from '../import.schema';
import { createSelectColumnsQuery } from '../../../utils/postgres/postgres.query-builder';
import { IColumn } from '../intefaces/column.interface';

export async function receivePostgresColumns(
  imp: IImportModel
): Promise<IColumn[]> {
  const config = imp.database.config;
  const table = imp.database.table;

  const postgresConnection = new PostgresConnection(config);
  await postgresConnection.checkConnection();
  const columnsQuery = createSelectColumnsQuery(table);
  const retrievedColumns = await postgresConnection.queryRows(columnsQuery);

  const columns: IColumn[] = retrievedColumns.map((column) => {
    return {
      name: column['column_name'],
      type: column['data_type']
    };
  });
  return columns;
}
