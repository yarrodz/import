import { IImportDocument } from '../imports/import.schema';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import OffsetPaginationTransferHelper from '../transfer/offset-pagination-transfer.helper';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { SqlConnector } from './connector/sql.connector';
import { createRequestedFields } from './connector/create-requested-fields';
import {
  createSelectCountQuery,
  createSelectDataQuery,
  paginateQuery
} from './connector/sql.query-builder';
import { SqlSequelizeDialectMap } from './connector/sql-sequelize-dialect.map';
import { Dialect as SequelizeDialect } from 'sequelize';
import IOffsetPaginationFunction from '../transfer/interfaces/offset-pagination-function.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';
import { SqlDialect } from './enums/sql-dialect.enum';
import { SqlImportTarget } from './enums/sql-import-target.enum';

class SqlTransferHelper {
  private importProcessesRepository: ImportProcessesRepository;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
  }

  public async transfer(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    let sqlConnector: SqlConnector;
    try {
      const { sql } = impt;
      const { connection, target, table, dialect } = sql;
      const processId = process._id;
      const sequelizeDialect = SqlSequelizeDialectMap[
        dialect
      ] as SequelizeDialect;

      sqlConnector = new SqlConnector({
        ...JSON.parse(JSON.stringify(connection)),
        dialect: sequelizeDialect
      });
      await sqlConnector.connect();

      //transfer from table
      switch (target) {
        case SqlImportTarget.TABLE: {
          await this.transferFromTable(impt, processId, sqlConnector, dialect);
          //transfer from custom select
          break;
        }
        case SqlImportTarget.SELECT: {
          await this.transferFromSelect(impt, processId, sqlConnector, dialect);
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}`);
        }
      }
      sqlConnector.disconnect();
    } catch (error) {
      console.error(error);
      sqlConnector.disconnect();
      throw new Error(`Error while sql transfer: ${error.message}`);
    }
  }

  private async transferFromTable(
    impt: IImportDocument,
    processId: string,
    sqlConnector: SqlConnector,
    dialect: string
  ) {
    const { sql, fields, idColumn } = impt;
    const { table, limit } = sql;

    const countQuery = createSelectCountQuery(table);
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
    sqlConnector: SqlConnector,
    dialect: SqlDialect
  ) {
    const { sql, datasetsCount } = impt;
    const { select, limit } = sql;

    await this.importProcessesRepository.update(processId, { datasetsCount });

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
      impt,
      processId,
      limit,
      this.selectPaginationFunction,
      sqlConnector,
      dialect,
      select
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

  private selectPaginationFunction: IOffsetPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    sqlConnector: SqlConnector,
    dialect: SqlDialect,
    select: string,
    idColumn: string
  ) => {
    const { offset, limit } = offsetPagination;
    const paginatedQuery = paginateQuery(
      dialect,
      select,
      idColumn,
      offset,
      limit
    );
    return await sqlConnector.queryRows(paginatedQuery);
  };
}

export default SqlTransferHelper;
