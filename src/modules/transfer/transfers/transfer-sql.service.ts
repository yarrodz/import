import { IImportDocument } from '../../imports/import.schema';
import ImportProcessesRepository from '../../import-processes/import-processes.repository';
import TransferHelper from '../transfer.helper';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import { SqlConnection } from '../../../utils/sql/sql.connection';
import { SQLDialectMap } from '../../../utils/sql/sql.dialect-map';
import { createRequestedFields } from '../../../utils/sql/create-requested-fields';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/sql/sql.query-builder';
import IPaginationFunction from '../interfaces/pagination-function.interface';

class TransferSQLService {
  private importProcessesRepository: ImportProcessesRepository;
  private transferHelper: TransferHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    transferHelper: TransferHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.transferHelper = transferHelper;
  }

  public async transfer(
    impt: IImportDocument,
    process: IImportProcessDocument,
    limit: number
  ): Promise<void> {
    let sqlConnection: SqlConnection;
    try {
      const { source, database } = impt;
      const { connection, table } = database;
      const processId = process._id;
      const dialect = SQLDialectMap[source];

      sqlConnection = new SqlConnection({
        ...connection,
        dialect
      });
      await sqlConnection.connect();

      const offset = process.processedDatasetsCount;

      //transfer from table
      if (table) {
        await this.transferFromTable(
          impt,
          processId,
          sqlConnection,
          source,
          offset,
          limit
        );
        //transfer from custom select
      } else {
        await this.transferFromCustomSelect(
          impt,
          processId,
          sqlConnection,
          source,
          offset,
          limit
        );
      }
      sqlConnection.disconnect();
    } catch (error) {
      sqlConnection.disconnect();
      throw error;
    }
  }

  private async transferFromTable(
    impt: IImportDocument,
    processId: string,
    sqlConnection: SqlConnection,
    dialect: string,
    offset: number,
    limit: number
  ) {
    const { database, fields } = impt;
    const { idColumn, table } = database;

    const countQuery = createSelectCountQuery(table);
    const datasetsCount = await sqlConnection.queryResult(countQuery);
    await this.importProcessesRepository.update(processId, { datasetsCount });

    const requestedFields = createRequestedFields(fields, idColumn);

    await this.transferHelper.paginationTransfer(
      impt,
      processId,
      idColumn,
      datasetsCount,
      offset,
      limit,
      this.tablePaginationFunction,
      sqlConnection,
      dialect,
      table,
      idColumn,
      requestedFields
    );
  }

  private async transferFromCustomSelect(
    impt: IImportDocument,
    processId: string,
    sqlConnection: SqlConnection,
    dialect: string,
    offset: number,
    limit: number
  ) {
    const { database } = impt;
    const { idColumn, customSelect, datasetsCount } = database;

    await this.importProcessesRepository.update(processId, { datasetsCount });

    await this.transferHelper.paginationTransfer(
      impt,
      processId,
      idColumn,
      datasetsCount,
      offset,
      limit,
      this.customSelectPaginationFunction,
      sqlConnection,
      dialect,
      customSelect,
      idColumn
    );
  }

  private tablePaginationFunction: IPaginationFunction = async (
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

  private customSelectPaginationFunction: IPaginationFunction = async (
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
}

export default TransferSQLService;
