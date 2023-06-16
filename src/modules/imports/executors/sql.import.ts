import { IImportModel } from '../import.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { createRequestedFields } from '../helpers/create-requested-fields';
import { paginationImport } from '../helpers/pagination-import';
import { SqlConnection } from '../../../utils/sql/sql.connection';
import { dialectMap } from '../../../utils/sql/dialect.map';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/sql/sql.query-builder';

const LIMIT = 100;

export async function sqlImport(
  imp: IImportModel,
  importProcess: IImportProcessModel
) {
  const dialect = imp.source;
  const config = imp.database.config;
  const fields = imp.fields;
  const idColumn = imp.idColumn;
  const table = imp.database.table;
  const customSelect = imp.database.customSelect;
  const datasetsCount = imp.database.datasetsCount;

  const sqlConnection = new SqlConnection(
    config.database,
    config.user,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: dialectMap[dialect]
    }
  );
  await sqlConnection.connect();
  const offset = importProcess.processedDatasetsCount;

  if (table) {
    const requestedFields = createRequestedFields(fields, idColumn);
    const countQuery = createSelectCountQuery(table);
    const datasetsCount = await sqlConnection.queryCount(countQuery);
    console.log(datasetsCount);
    await importProcess.updateOne({ datasetsCount });

    await paginationImport(
      imp,
      importProcess,
      idColumn,
      datasetsCount,
      offset,
      LIMIT,
      tablePaginationFunction,
      sqlConnection,
      dialect,
      table,
      idColumn,
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
      sqlConnection,
      dialect,
      customSelect,
      idColumn
    );
  }
  sqlConnection.disconnect();
}

async function tablePaginationFunction(
  offset: number,
  limit: number,
  sqlConnection: SqlConnection,
  dialect: string,
  table: string,
  idColumn: string,
  requestedFields: string[]
): Promise<object[]> {
  const rowsQuery = createSelectDataQuery(
    dialect,
    table,
    idColumn,
    requestedFields,
    offset,
    limit
  );
  return await sqlConnection.queryRows(rowsQuery);
}

async function customSelectPaginationFunction(
  offset: number,
  limit: number,
  sqlConnection: SqlConnection,
  dialect: string,
  customSelect: string,
  idColumn: string
): Promise<object[]> {
  const paginatedQuery = paginateQuery(
    dialect,
    customSelect,
    idColumn,
    offset,
    limit
  );
  console.log(paginatedQuery)
  return await sqlConnection.queryRows(paginatedQuery);
}
