import { PostgresConnection } from '../../../utils/postgres/postgres.connection';

import { ConnectInput } from '../inputs/connect.input';
import {
  createSelectColumnsQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/postgres/postgres.query-builder';
import { IColumn } from '../intefaces/column.interface';

export async function receivePostgresColumns(
  connectInput: ConnectInput
): Promise<IColumn[]> {
  const config = connectInput.database.config;
  const table = connectInput.database.table;
  const customSelect = connectInput.database.customSelect;

  const postgresConnection = new PostgresConnection(config);
  await postgresConnection.checkConnection();

  if (table) {
    const columnsQuery = createSelectColumnsQuery(table);
    const retrievedColumns = await postgresConnection.queryRows(columnsQuery);

    const columns: IColumn[] = retrievedColumns.map((column) => {
      return {
        name: column['column_name'],
        type: column['data_type']
      };
    });
    return columns;
  } else {
    const paginatedQuery = paginateQuery(customSelect, 1, 0);
    const retrievedDatasets = await postgresConnection.queryRows(
      paginatedQuery
    );
    if (retrievedDatasets.length === 0) {
      throw new Error('Table is empty');
    }
    const dataset = retrievedDatasets[0];
    const columns: IColumn[] = Object.entries(dataset).map(([key, value]) => {
      return {
        name: key,
        type: typeof value
      };
    });
    return columns;
  }
}
