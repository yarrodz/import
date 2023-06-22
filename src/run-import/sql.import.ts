import { createRequestedFields } from '../helpers/create-requested-fields';
import { paginationImport } from '../helpers/pagination-import';
import { SqlConnection } from '../utils/sql/sql.connection';
import { dialectMap } from '../utils/sql/dialect.map';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from '../utils/sql/sql.query-builder';
import { IImportDocument } from '../modules/imports/import.schema';
import { IImportProcessDocument } from '../modules/import-processes/import-process.schema';
import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import { IPaginationFunction } from '../intefaces/pagination-function.interface';
import { IField } from '../modules/imports/sub-schemas/field.schema';

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

    sqlConnection = new SqlConnection({
      ...connection,
      dialect: dialectMap[dialect]
    });
    await sqlConnection.connect();
    const offset = process.processedDatasetsCount;

    //Import using table name
    if (table) {
      await importFromTable(
        impt,
        process,
        sqlConnection,
        dialect,
        table,
        idColumn,
        fields,
        offset
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

async function importFromTable(
  impt: IImportDocument,
  process: IImportProcessDocument,
  sqlConnection: SqlConnection,
  dialect: string,
  table: string,
  idColumn: string,
  fields: IField[],
  offset: number
) {
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
}

const tablePaginationFunction: IPaginationFunction = async (
  offset: number,
  limit: number,
  sqlConnection: SqlConnection,
  dialect: string,
  table: string,
  idColumn: string,
  requestedFields: string[]
) => {
  const rowsQuery = createSelectDataQuery(
    dialect,
    table,
    idColumn,
    offset,
    limit,
    requestedFields
  );
  return await sqlConnection.queryRows(rowsQuery);
};

const customSelectPaginationFunction: IPaginationFunction = async (
  offset: number,
  limit: number,
  sqlConnection: SqlConnection,
  dialect: string,
  customSelect: string,
  idColumn: string
) => {
  const paginatedQuery = paginateQuery(
    dialect,
    customSelect,
    idColumn,
    offset,
    limit
  );
  return await sqlConnection.queryRows(paginatedQuery);
};
