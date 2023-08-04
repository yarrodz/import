import { Server as IO } from 'socket.io';
import { iFrameTransfer } from 'iframe-ai';

import ImportStepHelper from './import-step.helper';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from '../interfaces/transfer.interface';
import dbClient from '../../../utils/db-client/db-client';
import { TransferStatus } from '../enums/transfer-status.enum';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class ChunkTransferHelper {
  private io: IO;
  private importStepHelper: ImportStepHelper;

  constructor(io: IO, importStepHelper: ImportStepHelper) {
    this.io = io;
    this.importStepHelper = importStepHelper;
  }

  public async chunkTransfer(
    synchronization: Synchronization,
    transfer: Transfer,
    chunkedDatasets: object[][]
  ) {
    let { id: transferId } = transfer;

    while (chunkedDatasets.length) {
      let refreshedTransfer = await new iFrameTransfer(dbClient).load(
        transferId
      );
      refreshedTransfer = transformIFrameInstance(refreshedTransfer);
      transferId = refreshedTransfer.id;

      if (refreshedTransfer.status === TransferStatus.PAUSED) {
        this.io
          .to(refreshedTransfer.toString())
          .emit('transfer', refreshedTransfer);
        return;
      }
      const chunk = chunkedDatasets.shift();
      await this.importStepHelper.importStep(
        synchronization,
        refreshedTransfer,
        chunk
      );
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

export default ChunkTransferHelper;
