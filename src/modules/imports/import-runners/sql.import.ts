import { createRequestedFields } from '../helpers/create-requested-fields';
import { paginationImport } from '../helpers/pagination-import';
import { SqlConnection } from '../../../utils/sql/sql.connection';
import { dialectMap } from '../../../utils/sql/dialect.map';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/sql/sql.query-builder';
import { IImportDocument } from '../import.schema';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import ImportProcessesRepository from '../../import-processes/import-processes.repository';

const LIMIT = 100;

export async function sqlImport(
  impt: IImportDocument,
  process: IImportProcessDocument
) {
  let sqlConnection: SqlConnection;
  try {
    const dialect = impt.source;
    const connection = impt.database.connection;
    const idColumn = impt.database.idColumn;
    const table = impt.database.table;
    const customSelect = impt.database.customSelect;
    const datasetsCount = impt.database.datasetsCount;
    const fields = impt.fields;

    sqlConnection = new SqlConnection(
      connection.database,
      connection.username,
      connection.password,
      {
        host: connection.host,
        port: connection.port,
        dialect: dialectMap[dialect]
      }
    );
    await sqlConnection.connect();
    const offset = process.processedDatasetsCount;

    //Import using table name
    if (table) {
      const requestedFields = createRequestedFields(fields, idColumn);
      const countQuery = createSelectCountQuery(table);
      const datasetsCount = await sqlConnection.queryCount(countQuery);
      await ImportProcessesRepository.update(process._id, { datasetsCount });

      await paginationImport(
        impt,
        process,
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
      //Import using custom select
    } else {
      await ImportProcessesRepository.update(process._id, { datasetsCount });

      await paginationImport(
        impt,
        process,
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
  } catch (error) {
    sqlConnection.disconnect();
    throw error;
  }
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
  return await sqlConnection.queryRows(paginatedQuery);
}