import { IImportDocument } from '../imports/import.schema';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import TransferHelper from '../transfer/transfer.helper';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { SqlConnector } from './connector/sql.connection';
import { SQLDialectMap } from './connector/sql.dialect-map';
import { createRequestedFields } from './connector/create-requested-fields';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from './connector/sql.query-builder';
import IPaginationFunction from '../transfer/interfaces/pagination-function.interface';

class SqlTranserService {
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
    process: IImportProcessDocument
  ): Promise<void> {
    let sqlConnector: SqlConnector;
    try {
      const { source, database } = impt;
      const { connection, table, limitPerSecond } = database;
      const processId = process._id;
      const dialect = SQLDialectMap[source];

      sqlConnector = new SqlConnector({
        ...connection,
        dialect
      });
      await sqlConnector.connect();

      const offset = process.processedDatasetsCount;

      //transfer from table
      if (table) {
        await this.transferFromTable(
          impt,
          processId,
          sqlConnector,
          source,
          offset,
          limitPerSecond
        );
        //transfer from custom select
      } else {
        await this.transferFromCustomSelect(
          impt,
          processId,
          sqlConnector,
          source,
          offset,
          limitPerSecond
        );
      }
      sqlConnector.disconnect();
    } catch (error) {
      sqlConnector.disconnect();
      throw error;
    }
  }

  private async transferFromTable(
    impt: IImportDocument,
    processId: string,
    sqlConnector: SqlConnector,
    dialect: string,
    offset: number,
    limitPerSecond: number
  ) {
    const { database, fields } = impt;
    const { idColumn, table } = database;

    const countQuery = createSelectCountQuery(table);
    const datasetsCount = await sqlConnector.queryResult(countQuery);
    await this.importProcessesRepository.update(processId, { datasetsCount });

    const requestedFields = createRequestedFields(fields, idColumn);

    await this.transferHelper.paginationTransfer(
      impt,
      processId,
      idColumn,
      datasetsCount,
      offset,
      limitPerSecond,
      this.tablePaginationFunction,
      sqlConnector,
      dialect,
      table,
      idColumn,
      requestedFields
    );
  }

  private async transferFromCustomSelect(
    impt: IImportDocument,
    processId: string,
    sqlConnector: SqlConnector,
    dialect: string,
    offset: number,
    limitPerSecond: number
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
      limitPerSecond,
      this.customSelectPaginationFunction,
      sqlConnector,
      dialect,
      customSelect,
      idColumn
    );
  }

  private tablePaginationFunction: IPaginationFunction = async (
    offset: number,
    limitPerSecond: number,
    sqlConnector: SqlConnector,
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
      limitPerSecond,
      requestedFields
    );
    return await sqlConnector.queryRows(rowsQuery);
  };

  private customSelectPaginationFunction: IPaginationFunction = async (
    offset: number,
    limitPerSecond: number,
    sqlConnector: SqlConnector,
    dialect: string,
    customSelect: string,
    idColumn: string
  ) => {
    const paginatedQuery = paginateQuery(
      dialect,
      customSelect,
      idColumn,
      offset,
      limitPerSecond
    );
    return await sqlConnector.queryRows(paginatedQuery);
  };
}

export default SqlTranserService;
