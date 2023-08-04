import { Server as IO } from 'socket.io';
import { iFrameTransfer } from 'iframe-ai';

import ImportStepHelper from './import-step.helper';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from '../interfaces/transfer.interface';
import OffsetPaginationFunction from '../interfaces/offset-pagination-function.interface';
import dbClient from '../../../utils/db-client/db-client';
import OffsetPagination from '../interfaces/offset-pagination.interface';
import sleep from '../../../utils/sleep/sleep';
import { TransferStatus } from '../enums/transfer-status.enum';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class OffsetPaginationTransferHelper {
  private io: IO;
  private importStepHelper: ImportStepHelper;

  constructor(io: IO, importStepHelper: ImportStepHelper) {
    this.io = io;
    this.importStepHelper = importStepHelper;
  }

  public async offsetPaginationTransfer(
    synchronization: Synchronization,
    transfer: Transfer,
    limit: number,
    offsetPaginationFunction: OffsetPaginationFunction,
    ...offsetPaginationFunctionParams: any[]
  ) {
    const { limitRequestsPerSecond } = synchronization;
    let { id: transferId } = transfer;

    let { processedDatasetsCount: offset, totalDatasetsCount } = transfer;

    console.log('offset: ', offset);
    console.log('totalDatasetsCount: ', totalDatasetsCount);
    while (offset < totalDatasetsCount) {
      let requestCounter = 0;
      const startDate = new Date();

      while (requestCounter < limitRequestsPerSecond) {
        requestCounter++;

        let refreshedTransfer = await new iFrameTransfer(dbClient).load(
          transferId
        );
        refreshedTransfer = transformIFrameInstance(refreshedTransfer);
        transferId = refreshedTransfer.id;
        // console.log('refreshedTransfer: ', refreshedTransfer);

        if (refreshedTransfer.status === TransferStatus.PAUSED) {
          this.io
            .to(refreshedTransfer.toString())
            .emit('transfer', refreshedTransfer);
          return;
        }

        const offsetPagination: OffsetPagination = {
          offset,
          limit
        };
        const datasets = await offsetPaginationFunction(
          offsetPagination,
          ...offsetPaginationFunctionParams
        );

        console.log('datasets.length: ', datasets.length);

        if (datasets.length === 0) {
          break;
        }

        await this.importStepHelper.importStep(
          synchronization,
          refreshedTransfer,
          datasets
        );

        offset += limit;
      }
      const endDate = new Date();
      const requestsExectionTime = endDate.getTime() - startDate.getTime();
      if (requestsExectionTime < 1000) {
        const remainingToSecond = 1000 - requestsExectionTime;
        await sleep(remainingToSecond);
      }
    }
    console.log('finish');

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
    this.io.to(transferId.toString()).emit('transfer', completedTransfer);
  }
}

export default OffsetPaginationTransferHelper;
