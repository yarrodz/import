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
import IPaginationFunction from '../transfer/interfaces/offset-pagination-function.interface';
import IOffsetPaginationFunction from '../transfer/interfaces/offset-pagination-function.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';

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
      const { connection, table } = database;
      const processId = process._id;
      const dialect = SQLDialectMap[source];

      sqlConnector = new SqlConnector({
        ...connection,
        dialect
      });
      await sqlConnector.connect();

      //transfer from table
      if (table) {
        await this.transferFromTable(impt, processId, sqlConnector, source);
        //transfer from custom select
      } else {
        await this.transferFromCustomSelect(
          impt,
          processId,
          sqlConnector,
          source
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
    dialect: string
  ) {
    const { database, fields, idColumn } = impt;
    const { table, limit } = database;

    const countQuery = createSelectCountQuery(table);
    const datasetsCount = await sqlConnector.queryResult(countQuery);
    console.log('datasetsCount: ', datasetsCount);
    await this.importProcessesRepository.update(processId, { datasetsCount });

    const requestedFields = createRequestedFields(fields, idColumn);

    await this.transferHelper.offsetPaginationTransfer(
      impt,
      processId,
      limit,
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
    dialect: string
  ) {
    const { database, datasetsCount } = impt;
    const { customSelect, limit } = database;

    await this.importProcessesRepository.update(processId, { datasetsCount });

    await this.transferHelper.offsetPaginationTransfer(
      impt,
      processId,
      limit,
      this.customSelectPaginationFunction,
      sqlConnector,
      dialect,
      customSelect
    );
  }

  private tablePaginationFunction: IOffsetPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    sqlConnector: SqlConnector,
    dialect: string,
    table: string,
    idColumn: string,
    requestedFields: string[]
  ) => {
    const { offset, limit } = offsetPagination;
    const rowsQuery = createSelectDataQuery(
      dialect,
      table,
      idColumn,
      offset,
      limit,
      requestedFields
    );
    return await sqlConnector.queryRows(rowsQuery);
  };

  private customSelectPaginationFunction: IPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    sqlConnector: SqlConnector,
    dialect: string,
    customSelect: string,
    idColumn: string
  ) => {
    const { offset, limit } = offsetPagination;
    const paginatedQuery = paginateQuery(
      dialect,
      customSelect,
      idColumn,
      offset,
      limit
    );
    return await sqlConnector.queryRows(paginatedQuery);
  };
}

export default SqlTranserService;
