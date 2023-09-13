import { Server as IO } from 'socket.io';

import { TransfersRepository } from '../transfers.repository';
import { TransferParams } from '../interfaces/transfer-params.interace';
import { TransferState } from '../enums/transfer-state.enum';
import {
  FetchDatasetsFunction,
  FetchDatasetsFunctionResult
} from '../interfaces/fetch-datasets-function.interface';
import { OffsetPagination } from '../interfaces/offset-pagination.interface';
import { CursorPagination } from '../interfaces/cursor-pagination.interface';
import { PaginationType } from '../enums/pagination-type.enum';

export class TransferHelper {
  private io: IO;
  private transfersRepository: TransfersRepository;

  constructor(io: IO, transfersRepository: TransfersRepository) {
    this.io = io;
    this.transfersRepository = transfersRepository;
  }

  public async transfer(params: TransferParams) {
    const {
      process,
      transfer,
      limitDatasetsPerStep,
      paginationType,
      fetchFunction,
      transformFunction,
      saveFunction
    } = params;
    // const { limitRequestsPerSecond } = process;
    const { id: transferId, total, references } = transfer;
    // const { placement: finishConditionPlacement, fn: finishCondition } = finishConditionFunction;
    const { id: unitId } = process.__.inUnit;

    let datasets = [];
    do {
      const refreshedTransfer = await this.transfersRepository.load(transferId);

      let { offset, cursor } = refreshedTransfer;

      if (total && offset >= total) {
        break;
      }

      if (refreshedTransfer.state === TransferState.PAUSING) {
        const pausedTransfer = await this.transfersRepository.update({
          id: transferId,
          status: TransferState.PAUSED
        });

        this.io.to(String(unitId)).emit('transfer', pausedTransfer);
        return;
      }

      ({ datasets, cursor } = await this.fetchDatasets(
        fetchFunction,
        paginationType,
        limitDatasetsPerStep,
        offset,
        cursor
      ));

      offset += limitDatasetsPerStep;

      if (datasets.length === 0 && references === undefined) {
        break;
      }

      if (paginationType === PaginationType.CURSOR && !cursor) {
        break;
      }

      let transformedDatasets = await transformFunction(datasets);

      await saveFunction(transformedDatasets);

      const updatedTransfer = await this.transfersRepository.update({
        id: transferId,
        cursor,
        offset: transfer.offset + limitDatasetsPerStep,
        transfered: transfer.transfered + transformedDatasets.length,
        retryAttempts: 0
      });

      this.io.to(String(unitId)).emit('transfer', updatedTransfer);
    } while (true);

    const completedTransfer = await this.transfersRepository.update({
      id: transferId,
      status: TransferState.COMPLETED,
      log: 'Transfer succesfully completed'
    });

    this.io.to(String(unitId)).emit('transfer', completedTransfer);
  }

  //   private runWithTimelimit(transferStep: Function, limitPerSecond: number) {
  //     let requestCounter = 0;
  //     let requestsExectionTime = 0;
  //     const stepStartDate = new Date();

  //     const stepEndDate = new Date();
  //     const stepExectionTime = stepEndDate.getTime() - stepStartDate.getTime();
  //     requestCounter++;
  //     requestsExectionTime += stepExectionTime;
  //     if (requestCounter === limitRequestsPerSecond) {
  //       requestCounter = 0;
  //       if (requestsExectionTime < 1000) {
  //         const remainingToSecond = 1000 - requestsExectionTime;
  //         await sleep(remainingToSecond);
  //       }
  //     }
  //   }

  private async fetchDatasets(
    fetchFunction: FetchDatasetsFunction,
    paginationType: PaginationType,
    limit: number,
    offset?: number,
    cursor?: any
  ): Promise<FetchDatasetsFunctionResult> {
    switch (paginationType) {
      case PaginationType.OFFSET: {
        const pagination: OffsetPagination = { offset, limit };
        return await fetchFunction(pagination);
      }
      case PaginationType.CURSOR: {
        const pagination: CursorPagination = { cursor, limit };
        return await fetchFunction(pagination);
      }
      default: {
        throw new Error(
          `Error while transfer fetching datasets step. Unknown pagination type: ${paginationType}.`
        );
      }
    }
  }

  //   private finishCondition(
  //     datasets: object[],
  //     offset?: number,
  //     cursor?: any,
  //     total?: number,
  //     references?: any[]
  //   ) {
  //     if (total !== undefined && offset >= total) {
  //       return true;
  //     }

  //     if (references !== undefined && offset >= references.length) {
  //       return true;
  //     }

  //     if (datasets.length === 0 && references === undefined) {
  //       return true;
  //     }

  //     return false;
  //   }
}
