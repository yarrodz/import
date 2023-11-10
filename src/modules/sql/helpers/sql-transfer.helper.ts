import { SqlImportTarget } from '../enums/sql-import-target.enum';
import { TransferProcess } from '../../transfer-processes/interfaces/transfer-process.interface';
import { SqlConnector } from '../connectors/sql.connector';
import { SqlConnection } from '../interfaces/sql.connection.interface';
import { TransferParams } from '../../transfer-processes/interfaces/transfer-params.interace';
import { PaginationType } from '../../transfer-processes/enums/pagination-type.enum';
import { DatasetsRepository } from '../../datasets/datasets.repository';
import { SqlBaseTransferProcessHelper } from './sql-base-transfer-process.helper';
import { TransferProcessHelper } from '../../transfer-processes/helpers/transfer-process.helper';
import { SqlIframeTransfer } from '../interfaces/sql-iframe-transfer.interface';
import { FetchDatasetsCallback } from '../../transfer-processes/interfaces/callbacks/fetch-datasets-callback.interface';
import { selectFetch } from '../callbacks/select-fetch.callback';
import { tableFetch } from '../callbacks/table-fetch.callback';
import { TransferCallbacks } from '../../transfer-processes/interfaces/transfer-callbacks.interface';
import { completeSqlTransferCondition } from '../callbacks/complete-condition.callback';
import { saveDatasetsFunction } from '../../datasets/helpers/save-datasets.function';
import { TransformDatasetsHelper } from '../../datasets/helpers/transorm-datasets.helper';
import { OffsetPagination } from '../../transfer-processes/interfaces/offset-pagination.interface';

export class SqlTransferHelper {
  constructor(
    private datasetsRepository: DatasetsRepository,
    private sqlBaseTransferProcessHelper: SqlBaseTransferProcessHelper,
    private processHelper: TransferProcessHelper,
  ) {}

  public doTransfer = async (
    transfer: SqlIframeTransfer,
    process: TransferProcess
  ): Promise<void> => {
    try {
      const { __: relations } = transfer;
      const connection = relations.connection as SqlConnection;
      const { config } = connection;
      var sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      if (process === undefined) {
        process = await this.sqlBaseTransferProcessHelper.baseProcess(
          transfer,
          sqlConnector
        );
      }

      const params = this.createTransferParams(
        transfer,
        process,
        sqlConnector
      );

      await this.processHelper.transfer(params);
      sqlConnector.disconnect();
    } catch (error) {
      if (sqlConnector !== undefined) {
        sqlConnector.disconnect();
      }
    }
  };

  public async checkImport(
    connection: SqlConnection,
    transfer: SqlIframeTransfer
  ) {
    try {
      const { config } = connection;
      var sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();
      const fetchDatasetsFn = this.createTableFetchCallback(
        transfer,
        sqlConnector
      );
      const pagination: OffsetPagination = {
        offset: 0,
        limit: 1
      };
      await fetchDatasetsFn(pagination);
      sqlConnector.disconnect();
    } catch (error) {
      if (sqlConnector !== undefined) {
        sqlConnector.disconnect();
      }
      throw error;
    }
  }

  private createTransferParams(
    transfer: SqlIframeTransfer,
    process: TransferProcess,
    sqlConnector: SqlConnector,
  ): TransferParams {
    const { 
      limitDatasetsPerRequest,
      limitRequestsPerSecond,
      __: relations
    } = transfer;
    const { unit } = relations;

    const callbacks = this.createTransferCallbacks(
      transfer,
      sqlConnector
    )
    
    const params: TransferParams = {
      process,
      socketRoom: unit.id.toString(),
      paginationType: PaginationType.OFFSET,
      limitDatasetsPerRequest,
      limitRequestsPerSecond,
      callbacks,
      lastFetchedDatasets: []
    };

    return params;
  }

  private createTransferCallbacks(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ): TransferCallbacks {
    const fetchDatasets = this.createFetchDatasetsCallback(
      transfer,
      sqlConnector
    )
    const transformDatasets = TransformDatasetsHelper.transformDatasets;
    const saveDatasets = saveDatasetsFunction(this.datasetsRepository);
    const completeCondition = completeSqlTransferCondition;

    const callbacks: TransferCallbacks = {
      fetchDatasets,
      transformDatasets,
      saveDatasets,
      completeCondition
    }

    return callbacks;
  }

  private createFetchDatasetsCallback(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { target } = transfer;
    const cases = {
      [SqlImportTarget.TABLE]: this.createTableFetchCallback,
      [SqlImportTarget.SELECT]: this.createSelectFetchCallback
    }
    return cases[target](transfer, sqlConnector);
  }

  private createTableFetchCallback(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ): FetchDatasetsCallback {
    return tableFetch(transfer, sqlConnector);
  }

  private createSelectFetchCallback(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ): FetchDatasetsCallback {
    return selectFetch(transfer, sqlConnector);
  }
}
