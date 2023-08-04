import { iFrameTransfer } from 'iframe-ai';

import SqlColumnsHelper from './helpers/sql-columns.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import Synchronization from '../synchronizations/interfaces/synchronization.interface';
import Transfer from '../transfers/interfaces/transfer.interface';
import dbClient from '../../utils/db-client/db-client';
import SqlTransferHelper from './helpers/sql-transfer.helper';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferMethod } from '../transfers/enums/transfer-method.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

class SqlSynchronizationService {
  private sqlColumnsHelper: SqlColumnsHelper;
  private sqlTransferHelper: SqlTransferHelper;

  constructor(
    sqlColumnsHelper: SqlColumnsHelper,
    sqlTransferHelper: SqlTransferHelper
  ) {
    this.sqlColumnsHelper = sqlColumnsHelper;
    this.sqlTransferHelper = sqlTransferHelper;
  }

  async getColumns(synchronization: Synchronization): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: synchronizationId, import: impt } = synchronization;
      if (!impt) {
        responseHandler.setError(
          400,
          `Cannot retrive columns. Import not setted.`
        );
        return responseHandler;
      }

      // const idColumnUnique =
      //   await this.sqlColumnsHelper.checkIdColumnUniqueness(synchronization);
      // if (!idColumnUnique) {
      //   responseHandler.setError(
      //     409,
      //     'Provided id parameter includes duplicate values.'
      //   );
      //   return responseHandler;
      // }

      const columns = await this.sqlColumnsHelper.find(synchronization);

      responseHandler.setSuccess(200, {
        synchronizationId,
        columns
      });
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(synchronization: Synchronization): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: synchronizationId, unit } = synchronization;
      const { id: unitId } = unit;

      let transfer = await new iFrameTransfer(dbClient).insertOne(
        {
          type: TransferType.IMPORT,
          method: TransferMethod.OFFSET_PAGINATION,
          status: TransferStatus.PENDING,
          totalDatasetsCount: 0,
          processedDatasetsCount: 0,
          transferedDatasetsCount: 0,
          log: [],
          retryAttempts: 0,
          errorMessage: null
        },
        unitId,
        synchronizationId
      );
      transfer = transformIFrameInstance(transfer);
      console.log('go');
      const { id: transferId } = transfer;

      // We dont need to wait till import executes,
      // We send id of transfer
      // Client send websocket request and then sends event 'join' with transferId
      this.sqlTransferHelper.import(synchronization, transfer);
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(
    synchronization: Synchronization,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      let reloadedTransfer = await new iFrameTransfer(
        dbClient,
        {
          status: TransferStatus.PENDING
        },
        transferId
      ).save();
      reloadedTransfer = transformIFrameInstance(reloadedTransfer);

      const { id: reloadedTransferId } = reloadedTransfer;

      this.sqlTransferHelper.import(synchronization, reloadedTransfer);
      responseHandler.setSuccess(200, reloadedTransferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(
    synchronization: Synchronization,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      let retriedTransfer = await new iFrameTransfer(
        dbClient,
        {
          status: TransferStatus.PENDING,
          retryAttempts: 0,
          errorMessage: null
        },
        transferId
      ).save();
      retriedTransfer = transformIFrameInstance(retriedTransfer);

      const { id: retriedTransferId } = retriedTransfer;

      this.sqlTransferHelper.import(synchronization, retriedTransfer);
      responseHandler.setSuccess(200, retriedTransferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default SqlSynchronizationService;
