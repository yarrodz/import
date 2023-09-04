import { SqlImportTarget } from '../enums/sql-import-target.enum';
import {
  createSqlTableCountQuery,
  createSqlTableFindDataQuery
} from '../connector/sql-table.query-builder';
import { paginateSqlSelect } from '../connector/sql-select.query-builder';
import TransferFailureHandler from '../../transfers/helpers/transfer-failure-handler.helper';
import OffsetPaginationTransferHelper from '../../transfers/helpers/offset-pagination-transfer.helper';
import Transfer from '../../transfers/interfaces/transfer.interface';
import { SqlConnector } from '../connector/sql.connector';
import SqlImport from '../interfaces/sql-import.interface';
import { createRequestedFields } from '../connector/create-requested-fields';
import OffsetPaginationFunction from '../../transfers/interfaces/offset-pagination-function.interface';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import { SqlDialect } from '../enums/sql-dialect.enum';
import OuterTransferFunction, {
  OuterTransferFunctionParams
} from '../../transfers/interfaces/outer-transfer-function.interface';
import TransfersRepository from '../../transfers/transfers.repository';
import OffsetPaginationTransferParams from '../../transfers/interfaces/offset-pagination-transfer-params.interface';
import SqlConnection from '../interfaces/sql.connection.interface';
import SqlTransferHelper from './sql-transfer.helper';

class SqlImportHelper {
  private sqlTransferHelper: SqlTransferHelper;
  private transferFailureHandler: TransferFailureHandler;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;
  private transfersReporisotory: TransfersRepository;

  constructor(
    sqlTransferHelper: SqlTransferHelper,
    transferFailureHandler: TransferFailureHandler,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
    transfersReporisotory: TransfersRepository
  ) {
    this.sqlTransferHelper = sqlTransferHelper;
    this.transferFailureHandler = transferFailureHandler;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    this.transfersReporisotory = transfersReporisotory;
  }

  public import: OuterTransferFunction = async (
    params: OuterTransferFunctionParams
  ): Promise<void> => {
    let sqlConnector: SqlConnector;
    const impt = params.import as SqlImport;
    const { target } = impt;
    const connection = impt.__.hasConnection as SqlConnection;
    const { config } = connection;
    const { dialect } = config;
    let { transfer } = params;
    try {
      if (transfer === undefined) {
        transfer = await this.sqlTransferHelper.createStartedTransfer(impt);
      }

      sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      switch (target) {
        case SqlImportTarget.TABLE: {
          await this.tableImport(impt, transfer, sqlConnector, dialect);
          break;
        }
        case SqlImportTarget.SELECT: {
          await this.selectImport(impt, transfer, sqlConnector);
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}.`);
        }
      }

      sqlConnector.disconnect();
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();

      this.transferFailureHandler.handle({
        error,
        outerTransferFunction: this.import,
        import: impt,
        transfer
      });
    }
  };

  private async tableImport(
    impt: SqlImport,
    transfer: Transfer,
    sqlConnector: SqlConnector,
    dialect: string
  ) {
    const { id: transferId } = transfer;
    const { table, limit, fields, idKey } = impt;

    const countQuery = createSqlTableCountQuery(table);
    const datasetsCount = await sqlConnector.queryResult(countQuery);
    const updatedTransfer = await this.transfersReporisotory.update({
      id: transferId,
      datasetsCount: Number(datasetsCount)
    });

    const requestedFields = createRequestedFields(fields, idKey);

    const offsetPaginationTransferParams: OffsetPaginationTransferParams = {
      import: impt,
      transfer: updatedTransfer,
      limitPerStep: limit,
      paginationFunction: {
        fn: this.tablePaginationFunction,
        params: [sqlConnector, dialect, table, idKey, requestedFields]
      }
    };

    await this.offsetPaginationTransferHelper.transfer(
      offsetPaginationTransferParams
    );
  }

  public async checkImport(connection: SqlConnection, impt: SqlImport) {
    let sqlConnector: SqlConnector;
    try {
      const { config } = connection;
      const { dialect } = config;
      const { target, table, select, idKey } = impt;

      sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      const pagination: OffsetPagination = {
        offset: 0,
        limit: 1
      };

      switch (target) {
        case SqlImportTarget.TABLE: {
          await this.tablePaginationFunction(
            pagination,
            sqlConnector,
            dialect,
            table,
            idKey,
            [idKey]
          );
          break;
        }
        case SqlImportTarget.SELECT: {
          await this.selectPaginationFunction(
            pagination,
            sqlConnector,
            select,
            idKey
          );
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}.`);
        }
      }
      sqlConnector.disconnect();
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();
      throw error;
    }
  }

  private async selectImport(
    impt: SqlImport,
    transfer: Transfer,
    sqlConnector: SqlConnector
  ) {
    const { select, limit, idKey } = impt;

    const offsetPaginationTransferParams: OffsetPaginationTransferParams = {
      import: impt,
      transfer,
      limitPerStep: limit,
      paginationFunction: {
        fn: this.selectPaginationFunction,
        params: [sqlConnector, select, idKey]
      }
    };

    await this.offsetPaginationTransferHelper.transfer(
      offsetPaginationTransferParams
    );
  }

  private tablePaginationFunction: OffsetPaginationFunction = async (
    offsetPagination: OffsetPagination,
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

  private selectPaginationFunction: OffsetPaginationFunction = async (
    offsetPagination: OffsetPagination,
    sqlConnector: SqlConnector,
    select: string,
    idColumn: string
  ) => {
    const { offset, limit } = offsetPagination;
    const paginatedQuery = paginateSqlSelect(select, idColumn, offset, limit);
    return await sqlConnector.queryRows(paginatedQuery);
  };
}

export default SqlImportHelper;
