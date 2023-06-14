import { IImportModel } from '../import.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { PostgresConnection } from '../../../utils/postgres/postgres.connection';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/postgres/postgres.query-builder';
import { createRequestedFields } from '../helpers/create-requested-fields';
import { paginationImport } from '../helpers/pagination-import';

const LIMIT = 100;

export async function postgresImport(
  imp: IImportModel,
  importProcess: IImportProcessModel
) {
  const config = imp.database.config;
  const fields = imp.fields;
  const idColumn = imp.idColumn;
  const table = imp.database.table;
  const customSelect = imp.database.customSelect;
  const datasetsCount = imp.database.datasetsCount;

  const postgresConnection = new PostgresConnection(config);
  await postgresConnection.checkConnection();
  const offset = importProcess.processedDatasetsCount;

  if (table) {
    const requestedFields = createRequestedFields(fields, idColumn);
    const countQuery = createSelectCountQuery(table);
    const datasetsCount = await postgresConnection.queryCount(countQuery);
    await importProcess.updateOne({ datasetsCount });

    await paginationImport(
      imp,
      importProcess,
      idColumn,
      datasetsCount,
      offset,
      LIMIT,
      tablePaginationFunction,
      postgresConnection,
      table,
      requestedFields
    );
  } else {
    await importProcess.updateOne({ datasetsCount });

    await paginationImport(
      imp,
      importProcess,
      idColumn,
      datasetsCount,
      offset,
      LIMIT,
      customSelectPaginationFunction,
      postgresConnection,
      customSelect
    );
  }
}

async function tablePaginationFunction(
  offset: number,
  limit: number,
  postgresConnection: PostgresConnection,
  table: string,
  requestedFields: string[]
): Promise<object[]> {
  const rowsQuery = createSelectDataQuery(
    table,
    requestedFields,
    limit,
    offset
  );
  return await postgresConnection.queryRows(rowsQuery);
}

async function customSelectPaginationFunction(
  offset: number,
  limit: number,
  postgresConnection: PostgresConnection,
  customSelect: string
): Promise<object[]> {
  const paginatedQuery = paginateQuery(customSelect, limit, offset);
  return await postgresConnection.queryRows(paginatedQuery);
}
