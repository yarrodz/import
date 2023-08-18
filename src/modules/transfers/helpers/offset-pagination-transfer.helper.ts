import { Server as IO } from 'socket.io';

import ImportStepHelper from './import-step.helper';
import TransfersRepository from '../transfers.repository';
import OffsetPaginationTransferParams from '../interfaces/offset-pagination-transfer-params.interface';
import { TransferStatus } from '../enums/transfer-status.enum';
import OffsetPagination from '../interfaces/offset-pagination.interface';
import sleep from '../../../utils/sleep/sleep';

class OffsetPaginationTransferHelper {
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

  public async transfer(params: OffsetPaginationTransferParams) {
    const { import: impt, transfer, limitPerStep, paginationFunction } = params;
    const { fn: paginationFn, params: paginationFnParams } = paginationFunction;
    const { limitRequestsPerSecond } = impt;
    let { id: transferId, datasetsCount } = transfer;

    let datasets = [];
    let requestCounter = 0;
    let requestsExectionTime = 0;
    do {
      const stepStartDate = new Date();
      const refreshedTransfer = await this.transfersRepository.load(transferId);
      if (refreshedTransfer.status === TransferStatus.PAUSED) {
        this.io.to(String(transferId)).emit('transfer', {
          ...refreshedTransfer,
          log: refreshedTransfer[0]
        });
        return;
      }

      const offset = refreshedTransfer.offset;

      if (datasetsCount && offset >= datasetsCount) {
        break;
      }

      const offsetPagination: OffsetPagination = {
        offset,
        limit: limitPerStep
      };

      datasets = await paginationFn(offsetPagination, ...paginationFnParams);

      if (datasets.length === 0) {
        break;
      }

      await this.importStepHelper.step(impt, refreshedTransfer, datasets);

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

export default OffsetPaginationTransferHelper;
