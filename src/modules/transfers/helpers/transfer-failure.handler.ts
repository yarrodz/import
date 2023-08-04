import { Server as IO } from 'socket.io';
import { iFrameTransfer } from 'iframe-ai';

import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from '../interfaces/transfer.interface';
import dbClient from '../../../utils/db-client/db-client';
import { TransferStatus } from '../enums/transfer-status.enum';
import sleep from '../../../utils/sleep/sleep';
import TransferFunction from '../interfaces/transfer-function.interface';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class TransferFailureHandler {
  private io: IO;

  constructor(io: IO) {
    this.io = io;
  }

  public async handle(
    error: Error,
    transferFunction: TransferFunction,
    synchronization: Synchronization,
    transfer: Transfer
  ): Promise<void> {
    console.error('error: ', error);
    const { retryOptions } = synchronization;
    const { id: transferId } = transfer;
    const { maxAttempts, attemptTimeDelay } = retryOptions;
    let refreshedTransfer = await new iFrameTransfer(dbClient).load(transferId);
    refreshedTransfer = transformIFrameInstance(refreshedTransfer);
    const { retryAttempts } = refreshedTransfer;

    switch (retryAttempts) {
      case maxAttempts:
        await this.failTransfer(error, refreshedTransfer);
        break;
      default:
        await this.retryTransfer(
          transferFunction,
          synchronization,
          refreshedTransfer,
          attemptTimeDelay
        );
        break;
    }
  }

  private async failTransfer(error: Error, transfer: Transfer): Promise<void> {
    const { id: transferId } = transfer;
    let failedTransfer = await new iFrameTransfer(
      dbClient,
      {
        status: TransferStatus.FAILED,
        errorMessage: error.message
      },
      transferId
    ).save();
    failedTransfer = transformIFrameInstance(failedTransfer);
    this.io.to(transferId.toString()).emit('transfer', failedTransfer);
  }

  private async retryTransfer(
    transferFunction: TransferFunction,
    synchronization: Synchronization,
    transfer: Transfer,
    attemptTimeDelay: number
  ): Promise<void> {
    const { id: transferId } = transfer;

    let retriedTransfer = await new iFrameTransfer(
      dbClient,
      {
        retryAttempts: transfer.retryAttempts + 1
      },
      transferId
    ).save();
    retriedTransfer = transformIFrameInstance(retriedTransfer);
    await sleep(attemptTimeDelay);
    await transferFunction(synchronization, retriedTransfer);
  }
}

export default TransferFailureHandler;
