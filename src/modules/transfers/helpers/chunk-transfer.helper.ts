import { Server as IO } from 'socket.io';

import { ImportStepHelper } from './import-step.helper';
import { TransfersRepository } from '../transfers.repository';
import { ChunkTransferParams } from '../interfaces/chunk-transfer-params.interface';
import { TransferStatus } from '../enums/transfer-status.enum';

export class ChunkTransferHelper {
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

  public async transfer(params: ChunkTransferParams) {
    let { import: impt, transfer, datasets, chunkLength } = params;
    const { id: transferId, offset } = transfer;
    const { id: unitId } = impt.__.inUnit;

    let slicedDatasets = datasets.slice(offset, datasets.length);
    datasets = null;
    const chunkedDatasets = this.chunkObjectArray(slicedDatasets, chunkLength);
    slicedDatasets = null;

    while (chunkedDatasets.length) {
      const refreshedTransfer = await this.transfersRepository.load(transferId);
      if (refreshedTransfer.status === TransferStatus.PAUSING) {
        const pausedTransfer = await this.transfersRepository.update({
          id: transferId,
          status: TransferStatus.PAUSED
        });
        this.io.to(String(unitId)).emit('transfer', pausedTransfer);
        return;
      }

      const datasetsChunk = chunkedDatasets.shift();
      await this.importStepHelper.step(
        impt,
        refreshedTransfer,
        datasetsChunk,
        chunkLength
      );
    }

    const completedTransfer = await this.transfersRepository.update({
      id: transferId,
      status: TransferStatus.COMPLETED,
      log: 'Transfer succesfully completed'
    });
    this.io.to(String(unitId)).emit('transfer', completedTransfer);
  }

  // chunkObjectArray([1,2,3,4,5,6,7,8,9], 3) => [[1,2,3],[4,5,6],[7,8,9]]
  private chunkObjectArray(array: object[], chunkLength: number) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkLength) {
      const chunk = array.slice(i, i + chunkLength);
      chunkedArray.push(chunk);
    }
    return chunkedArray;
  }
}
