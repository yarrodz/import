import { SqlImportTarget } from '../enums/sql-import-target.enum';
import {
  createSqlTableCountQuery,
  createSqlTableFindDataQuery
} from '../connector/sql-table.query-builder';
import { paginateSqlSelect } from '../connector/sql-select.query-builder';
import { TransferFailureHandler } from '../../transfers/helpers/transfer-failure-handler.helper';
import { Transfer } from '../../transfers/interfaces/transfer.interface';
import { SqlConnector } from '../connector/sql.connector';
import { SqlImport } from '../interfaces/sql-import.interface';
import { createRequestedFields } from '../connector/create-requested-fields';
import { OffsetPagination } from '../../transfers/interfaces/offset-pagination.interface';
import { SqlDialect } from '../enums/sql-dialect.enum';
import {
  OuterTransferFunction,
  OuterTransferFunctionParams
} from '../../transfers/interfaces/outer-transfer-function.interface';
import { TransfersRepository } from '../../transfers/transfers.repository';
import { SqlConnection } from '../interfaces/sql.connection.interface';
import { SqlTransferHelper } from './sql-transfer.helper';
import { TransferHelper } from '../../transfers/helpers/transfer.helper';
import { TransferParams } from '../../transfers/interfaces/transfer-params.interace';
import { PaginationType } from '../../transfers/enums/pagination-type.enum';
import { TransformDatasetsHelper } from '../../datasets/helpers/transform-datasets.helper';
import { DatasetsRepository } from '../../datasets/datasets.repository';
import { TransformDatasetsFunction } from '../../transfers/interfaces/transform-datasets-function.interface';
import { SaveDatasetsFunction } from '../../transfers/interfaces/save-datasets-function.interface';
import { Dataset } from '../../datasets/interfaces/dataset.interface';
import { FetchDatasetsFunction } from '../../transfers/interfaces/fetch-datasets-function.interface';

export class SqlImportHelper {
  private sqlTransferHelper: SqlTransferHelper;
  private transferHelper: TransferHelper;
  private transferFailureHandler: TransferFailureHandler;
  private transformDatasetsHelper: TransformDatasetsHelper;
  private transfersReporisotory: TransfersRepository;
  private datasetsRepository: DatasetsRepository;

  constructor(
    sqlTransferHelper: SqlTransferHelper,
    transferHelper: TransferHelper,
    transferFailureHandler: TransferFailureHandler,
    transformDatasetsHelper: TransformDatasetsHelper,
    transfersReporisotory: TransfersRepository,
    datasetsRepository: DatasetsRepository
  ) {
    this.sqlTransferHelper = sqlTransferHelper;
    this.transferFailureHandler = transferFailureHandler;
    this.transferHelper = transferHelper;
    this.transformDatasetsHelper = transformDatasetsHelper;
    this.transfersReporisotory = transfersReporisotory;
    this.datasetsRepository = datasetsRepository;
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
        transfer = await this.sqlTransferHelper.createTransfer(impt);
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
          const tableFetchFunction = this.createTableFetchFunction(
            sqlConnector,
            dialect,
            table,
            idKey,
            [idKey]
          );

          await tableFetchFunction(pagination);
          break;
        }
        case SqlImportTarget.SELECT: {
          const selectFetchFunction = this.createSelectFetchFunction(
            sqlConnector,
            select,
            idKey
          );

          await selectFetchFunction(pagination);
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

  private async tableImport(
    import_: SqlImport,
    transfer: Transfer,
    sqlConnector: SqlConnector,
    dialect: SqlDialect
  ) {
    const { id: transferId } = transfer;
    const { table, limit, fields, idKey } = import_;

    const countQuery = createSqlTableCountQuery(table);
    const datasetsCount = await sqlConnector.queryResult(countQuery);

    const updatedTransfer = await this.transfersReporisotory.update({
      id: transferId,
      datasetsCount: Number(datasetsCount)
    });

    const requestedFields = createRequestedFields(fields, idKey);

    const fetchFunction = this.createTableFetchFunction(
      sqlConnector,
      dialect,
      table,
      idKey,
      requestedFields
    );
    const transformFunction = this.createTransformFunction(import_);
    const saveFunction = this.createSaveFunction();

    const transferParams: TransferParams = {
      process: import_,
      transfer: updatedTransfer,
      limitDatasetsPerStep: limit,
      paginationType: PaginationType.OFFSET,
      useReferences: false,
      fetchFunction,
      transformFunction,
      saveFunction
    };

    await this.transferHelper.transfer(transferParams);
  }

  private async selectImport(
    import_: SqlImport,
    transfer: Transfer,
    sqlConnector: SqlConnector
  ) {
    const { select, limit, idKey } = import_;

    const fetchFunction = this.createSelectFetchFunction(
      sqlConnector,
      select,
      idKey
    );
    const transformFunction = this.createTransformFunction(import_);
    const saveFunction = this.createSaveFunction();

    const transferParams: TransferParams = {
      process: import_,
      transfer,
      limitDatasetsPerStep: limit,
      paginationType: PaginationType.OFFSET,
      useReferences: false,
      fetchFunction,
      transformFunction,
      saveFunction
    };

    await this.transferHelper.transfer(transferParams);
  }

  private createTableFetchFunction(
    sqlConnector: SqlConnector,
    dialect: SqlDialect,
    table: string,
    idColumn: string,
    requestedFields: string[]
  ): FetchDatasetsFunction {
    return async function (pagination: OffsetPagination) {
      const { offset, limit } = pagination;

      const rowsQuery = createSqlTableFindDataQuery(
        dialect,
        table,
        idColumn,
        offset,
        limit,
        requestedFields
      );
      const datasets = await sqlConnector.queryRows(rowsQuery);

      return { datasets };
    };
  }

  private createSelectFetchFunction(
    sqlConnector: SqlConnector,
    select: string,
    idColumn: string
  ): FetchDatasetsFunction {
    return async function (pagination: OffsetPagination) {
      const { offset, limit } = pagination;

      const paginatedQuery = paginateSqlSelect(select, idColumn, offset, limit);
      const datasets = await sqlConnector.queryRows(paginatedQuery);

      return { datasets };
    };
  }

  private createTransformFunction(
    import_: SqlImport
  ): TransformDatasetsFunction {
    const self = this;

    return function (datasets: object[]) {
      return self.transformDatasetsHelper.transform(datasets, import_);
    };
  }

  private createSaveFunction(): SaveDatasetsFunction {
    const self = this;

    return function (datasets: Dataset[]) {
      return self.datasetsRepository.bulkSave(datasets);
    };
  }
}
