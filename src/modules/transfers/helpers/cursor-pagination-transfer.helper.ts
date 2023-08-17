import { Server as IO } from 'socket.io';

import ImportStepHelper from './import-step.helper';
import TransfersRepository from '../transfers.repository';
import CursorPaginationTransferParams from '../interfaces/cursor-pagination-transfer-params.interface';
import { TransferStatus } from '../enums/transfer-status.enum';
import CursorPagination from '../interfaces/cursor-pagination.interface';
import sleep from '../../../utils/sleep/sleep';

class CursorPaginationTransferHelper {
  private io: IO;
  private importStepHelper: ImportStepHelper;
  private transfersRepository: TransfersRepository;

  constructor(
    io: IO,
    importStepHelper: ImportStepHelper,
    transfersRepository: TransfersRepository
  ) {
    this.io = io;
    this.importStepHelper = importStepHelper;
    this.transfersRepository = transfersRepository;
  }

  public async transfer(params: CursorPaginationTransferParams) {
    const { import: impt, transfer, limitPerStep, paginationFunction } = params;
    const { fn: paginationFn, params: paginationFnParams } = paginationFunction;
    const { limitRequestsPerSecond } = impt;
    let { id: transferId, datasetsCount } = transfer;

    let datasets = [];
    let requestCounter = 0;
    let requestsExectionTime = 0;
    do {
      const stepStartDate = new Date();
      const refreshedTransfer = await this.transfersRepository.get(transferId);
      if (refreshedTransfer.status === TransferStatus.PAUSED) {
        this.io.to(String(transferId)).emit('transfer', {
          ...refreshedTransfer,
          log: refreshedTransfer.log[0]
        });
        return;
      }

      let { offset, cursor } = refreshedTransfer;

      if (datasetsCount && offset >= datasetsCount) {
        break;
      }

      const cursorPagination: CursorPagination = {
        cursor: refreshedTransfer.cursor,
        limit: limitPerStep
      };

      const result = await paginationFn(
        cursorPagination,
        ...paginationFnParams
      );
      cursor = result.cursor;
      datasets = result.datasets;

      if (datasets.length === 0) {
        break;
      }

      await this.importStepHelper.step(
        impt,
        refreshedTransfer,
        datasets,
        cursor
      );

      if (!cursor) {
        break;
      }

      const stepEndDate = new Date();
      const stepExectionTime = stepEndDate.getTime() - stepStartDate.getTime();
      requestCounter++;
      requestsExectionTime += stepExectionTime;

      if (requestCounter === limitRequestsPerSecond) {
        requestCounter = 0;
        if (requestsExectionTime < 1000) {
          const remainingToSecond = 1000 - requestsExectionTime;
          await sleep(remainingToSecond);
        }
      }
    } while (datasets.length);

    const completedTransfer = await this.transfersRepository.update({
      id: transferId,
      status: TransferStatus.COMPLETED
    });
    this.io.to(String(transferId)).emit('transfer', {
      ...completedTransfer,
      log: completedTransfer.log[0]
    });
  }
}

export default CursorPaginationTransferHelper;
