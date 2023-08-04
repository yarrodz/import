import { iFrameTransfer } from 'iframe-ai';

import { SqlImportTarget } from '../enums/sql-import-target.enum';
import {
  createSqlTableCountQuery,
  createSqlTableFindDataQuery
} from '../connector/sql-table.query-builder';
import { paginateSqlSelect } from '../connector/sql-select.query-builder';
import TransferFailureHandler from '../../transfers/helpers/transfer-failure.handler';
import OffsetPaginationTransferHelper from '../../transfers/helpers/offset-pagination-transfer.helper';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from '../../transfers/interfaces/transfer.interface';
import { SqlConnector } from '../connector/sql.connector';
import SqlImport from '../interfaces/sql-import.interface';
import SqlConnection from '../interfaces/sql.connection.interface';
import { SqlSequelizeDialectMap } from '../connector/sql-sequelize-dialect.map';
import { Dialect as SequelizeDialect } from 'sequelize';
import TransferFunction from '../../transfers/interfaces/transfer-function.interface';
import dbClient from '../../../utils/db-client/db-client';
import { createRequestedFields } from '../connector/create-requested-fields';
import OffsetPaginationFunction from '../../transfers/interfaces/offset-pagination-function.interface';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import { SqlDialect } from '../enums/sql-dialect.enum';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class SqlTransferHelper {
  private transferFailureHandler: TransferFailureHandler;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;

  constructor(
    transferFailureHandler: TransferFailureHandler,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper
  ) {
    this.transferFailureHandler = transferFailureHandler;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
  }

  public import: TransferFunction = async (
    synchronization: Synchronization,
    transfer: Transfer
  ) => {
    let sqlConnector: SqlConnector;
    try {
      const impt = synchronization.import as SqlImport;
      const connection = synchronization.connection as SqlConnection;
      const { target } = impt;
      const { dialect } = connection;

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
          await this.tableImport(
            synchronization,
            transfer,
            sqlConnector,
            dialect
          );
          break;
        }
        case SqlImportTarget.SELECT: {
          await this.selectImport(synchronization, transfer, sqlConnector);
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}`);
        }
      }
      sqlConnector.disconnect();
    } catch (error) {
      sqlConnector.disconnect();
      this.transferFailureHandler.handle(
        error,
        this.import,
        synchronization,
        transfer
      );
    }
  };

  private async tableImport(
    synchronization: Synchronization,
    transfer: Transfer,
    sqlConnector: SqlConnector,
    dialect: string
  ) {
    const { idParameterName } = synchronization;
    const { id: transferId } = transfer;
    const impt = synchronization.import as SqlImport;
    const { table, limit, fields } = impt;

    const countQuery = createSqlTableCountQuery(table);
    const totalDatasetsCount = await sqlConnector.queryResult(countQuery);

    let updatedTransfer = await new iFrameTransfer(
      dbClient,
      {
        totalDatasetsCount: Number(totalDatasetsCount)
      },
      transferId
    ).save();
    updatedTransfer = transformIFrameInstance(updatedTransfer);

    const requestedFields = createRequestedFields(fields, idParameterName);

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
      synchronization,
      updatedTransfer,
      limit,
      this.tablePaginationFunction,
      sqlConnector,
      dialect,
      table,
      idParameterName,
      requestedFields
    );
  }

  private async selectImport(
    synchronization: Synchronization,
    transfer: Transfer,
    sqlConnector: SqlConnector
  ) {
    const { idParameterName, totalDatasetsCount } = synchronization;
    const { id: transferId } = transfer;
    const impt = synchronization.import as SqlImport;
    const { select, limit } = impt;

    let updatedTransfer = await new iFrameTransfer(
      dbClient,
      {
        totalDatasetsCount: Number(totalDatasetsCount)
      },
      transferId
    ).save();
    updatedTransfer = transformIFrameInstance(updatedTransfer);

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
      synchronization,
      updatedTransfer,
      limit,
      this.selectPaginationFunction,
      sqlConnector,
      select,
      idParameterName
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
    // console.log('rows: ', await sqlConnector.queryRows(rowsQuery))
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

export default SqlTransferHelper;
