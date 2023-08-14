import { Server as IO } from 'socket.io';

import ImportStepHelper from './import-step.helper';
import TransfersRepository from '../transfers.repository';
import ChunkTransferParams from '../interfaces/chunk-transfer-params.interface';
import { TransferStatus } from '../enums/transfer-status.enum';

class ChunkTransferHelper {
  private io: IO;
  private importStepHelper: ImportStepHelper;
  private transfersRepository: TransfersRepository;

  constructor(io: IO, importStepHelper: ImportStepHelper) {
    this.io = io;
    this.importStepHelper = importStepHelper;
    this.transfersRepository = new TransfersRepository();
  }

  public async transfer(params: ChunkTransferParams) {
    let { import: impt, transfer, datasets, chunkLength } = params;
    const { id: transferId, offset } = transfer;

    let slicedDatasets = datasets.slice(offset, datasets.length);
    datasets = null;
    const chunkedDatasets = this.chunkObjectArray(slicedDatasets, chunkLength);
    slicedDatasets = null;

    while (chunkedDatasets.length) {
      const refreshedTransfer = await this.transfersRepository.get(transferId);
      if (refreshedTransfer.status === TransferStatus.PAUSED) {
        this.io.to(String(transferId)).emit('transfer', refreshedTransfer);
        return;
      }

      const datasetsChunk = chunkedDatasets.shift();
      await this.importStepHelper.step(impt, refreshedTransfer, datasetsChunk);
    }

    const completedTransfer = this.transfersRepository.update({
      id: transferId,
      status: TransferStatus.COMPLETED
    });
    this.io.to(String(transferId)).emit('transfer', completedTransfer);
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

export default ChunkTransferHelper;
