import ImportProcessesRepository from '../import-processes/import-processes.repository';
import ImportTransferFailureHandler from '../transfer/import-transfer-failure.handler';
import OffsetPaginationTransferHelper from '../transfer/offset-pagination-transfer.helper';
import IImportTransferFunction from '../transfer/interfaces/import-transfer-function.interface';
import { IImportDocument } from '../imports/import.schema';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { SqlConnector } from './connector/sql.connector';
import { createRequestedFields } from './connector/create-requested-fields';
import { SqlSequelizeDialectMap } from './connector/sql-sequelize-dialect.map';
import { Dialect as SequelizeDialect } from 'sequelize';
import IOffsetPaginationFunction from '../transfer/interfaces/offset-pagination-function.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';
import { SqlDialect } from './enums/sql-dialect.enum';
import { SqlImportTarget } from './enums/sql-import-target.enum';
import {
  createSqlTableCountQuery,
  createSqlTableFindDataQuery
} from './connector/sql-table.query-builder';
import { paginateSqlSelect } from './connector/sql-select.query-builder';

class SqlTransferHelper {
  private importProcessesRepository: ImportProcessesRepository;
  private importTransferFailureHandler: ImportTransferFailureHandler;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    importTransferFailureHandler: ImportTransferFailureHandler,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.importTransferFailureHandler = importTransferFailureHandler;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
  }

  public transfer: IImportTransferFunction = async (
    impt: IImportDocument,
    process: IImportProcessDocument
  ) => {
    let sqlConnector: SqlConnector;
    try {
      const { sql } = impt;
      const { connection, target, dialect } = sql;
      const processId = process._id;
      const sequelizeDialect = SqlSequelizeDialectMap[
        dialect
      ] as SequelizeDialect;

      sqlConnector = new SqlConnector({
        ...connection,
        dialect: sequelizeDialect
      });
      await sqlConnector.connect();

      switch (target) {
        case SqlImportTarget.TABLE: {
          await this.transferFromTable(impt, processId, sqlConnector, dialect);
          break;
        }
        case SqlImportTarget.SELECT: {
          await this.transferFromSelect(impt, processId, sqlConnector);
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}`);
        }
      }
      sqlConnector.disconnect();
    } catch (error) {
      sqlConnector.disconnect();
      this.importTransferFailureHandler.handle(
        error,
        this.transfer,
        impt,
        process
      );
    }
  };

  private async transferFromTable(
    impt: IImportDocument,
    processId: string,
    sqlConnector: SqlConnector,
    dialect: string
  ) {
    const { sql, fields, idColumn } = impt;
    const { table, limit } = sql;

    const countQuery = createSqlTableCountQuery(table);
    const datasetsCount = await sqlConnector.queryResult(countQuery);
    await this.importProcessesRepository.update(processId, { datasetsCount });

    const requestedFields = createRequestedFields(fields, idColumn);

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
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

  private async transferFromSelect(
    impt: IImportDocument,
    processId: string,
    sqlConnector: SqlConnector
  ) {
    const { sql, datasetsCount, idColumn } = impt;
    const { select, limit } = sql;

    await this.importProcessesRepository.update(processId, { datasetsCount });

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
      impt,
      processId,
      limit,
      this.selectPaginationFunction,
      sqlConnector,
      select,
      idColumn
    );
  }

  private tablePaginationFunction: IOffsetPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    sqlConnector: SqlConnector,
    dialect: SqlDialect,
    table: string,
    idColumn: string,
    requestedFields: string[]
  ) => {
    const { offset, limit } = offsetPagination;
    const rowsQuery = createSqlTableFindDataQuery(
      dialect,
      table,
      idColumn,
      offset,
      limit,
      requestedFields
    );
    return await sqlConnector.queryRows(rowsQuery);
  };

  private selectPaginationFunction: IOffsetPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    sqlConnector: SqlConnector,
    select: string,
    idColumn: string
  ) => {
    const { offset, limit } = offsetPagination;
    const paginatedQuery = paginateSqlSelect(select, idColumn, offset, limit);
    return await sqlConnector.queryRows(paginatedQuery);
  };
}

export default SqlTransferHelper;
