import { Server as IO } from 'socket.io';
import { iFrameTransfer } from 'iframe-ai';

import ImportStepHelper from './import-step.helper';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from '../interfaces/transfer.interface';
import CursorPaginationFunction from '../interfaces/cursor-pagination-function.interface';
import dbClient from '../../../utils/db-client/db-client';
import { TransferStatus } from '../enums/transfer-status.enum';
import CursorPagination from '../interfaces/cursor-pagination.interface';
import sleep from '../../../utils/sleep/sleep';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class CursorPaginationTransferHelper {
  private io: IO;
  private importStepHelper: ImportStepHelper;

  constructor(io: IO, importStepHelper: ImportStepHelper) {
    this.io = io;
    this.importStepHelper = importStepHelper;
  }

  public async cursorPaginationTransfer(
    synchronization: Synchronization,
    transfer: Transfer,
    limit: number,
    cursorPaginationFunction: CursorPaginationFunction,
    ...cursorPaginationFunctionParams: any[]
  ) {
    const { limitRequestsPerSecond } = synchronization;
    let { id: transferId } = transfer;

    let { processedDatasetsCount, totalDatasetsCount } = transfer;
    console.log('processedDatasetsCount: ', processedDatasetsCount);
    console.log('totalDatasetsCount: ', totalDatasetsCount);
    console.log('typeof totalDatasetsCount: ', typeof totalDatasetsCount);

    while (processedDatasetsCount < totalDatasetsCount) {
      let requestCounter = 0;
      const startDate = new Date();

      console.log('requestCounter: ', requestCounter);
      while (requestCounter < limitRequestsPerSecond) {
        requestCounter++;
        let refreshedTransfer = await new iFrameTransfer(dbClient).load(
          transferId
        );
        refreshedTransfer = transformIFrameInstance(refreshedTransfer);
        transferId = refreshedTransfer.id;
        console.log('refreshedTransfer: ', refreshedTransfer);
        if (refreshedTransfer.status === TransferStatus.PAUSED) {
          this.io
            .to(refreshedTransfer.toString())
            .emit('importProcess', refreshedTransfer);
          return;
        }

        processedDatasetsCount = refreshedTransfer.processedDatasetsCount;
        if (processedDatasetsCount >= totalDatasetsCount) {
          break;
        }

        const cursorPagination: CursorPagination = {
          cursor: refreshedTransfer.cursor,
          limit
        };

        const { cursor, datasets } = await cursorPaginationFunction(
          cursorPagination,
          ...cursorPaginationFunctionParams
        );

        await this.importStepHelper.importStep(
          synchronization,
          refreshedTransfer,
          datasets,
          cursor
        );

        if (!cursor || datasets.length === 0) {
          break;
        }
      }
      const endDate = new Date();
      const requestsExectionTime = endDate.getTime() - startDate.getTime();
      // console.log('requestsExectionTime: ', requestsExectionTime);
      // console.log('----------------');
      // If step executed faster than second. we have to wait for the remaining time so that there is a second in the sum
      if (requestsExectionTime < 1000) {
        const remainingToSecond = 1000 - requestsExectionTime;
        // console.log('remainingToSecond: ', remainingToSecond);
        await sleep(remainingToSecond);
      }
    }

    let completedTransfer = await new iFrameTransfer(
      dbClient,
      {
        status: TransferStatus.COMPLETED,
        errorMessage: null
      },
      transferId
    ).save();
    completedTransfer = transformIFrameInstance(completedTransfer);

    console.log('completedTransfer: ', completedTransfer);
  }
}

export default CursorPaginationTransferHelper;
