import { Server as IO } from 'socket.io';

import { TransfersRepository } from '../transfers.repository';
import { OuterTransferFunction } from '../interfaces/outer-transfer-function.interface';
import { Transfer } from '../interfaces/transfer.interface';
import { TransferState } from '../enums/transfer-state.enum';
import { sleep } from '../../../utils/sleep/sleep';
import { TransferFailureHandleParams } from '../interfaces/transfer-failure-handle-params.interface';
import { SqlImport } from '../../sql/interfaces/sql-import.interface';
import { ApiImport } from '../../api/interfaces/api-import.interface';
import { EmailImport } from '../../email/interfaces/email-import.interace';

export class TransferFailureHandler {
  private io: IO;
  private transfersRepository: TransfersRepository;

  constructor(io: IO, transfersRepository: TransfersRepository) {
    this.io = io;
    this.transfersRepository = transfersRepository;
  }

  public async handle(params: TransferFailureHandleParams): Promise<void> {
    const { error, outerTransferFunction, import: impt, transfer } = params;
    const { id: transferId } = transfer;
    const { retryOptions } = impt;
    const { maxAttempts, attemptTimeDelay } = retryOptions;
    const { id: unitId } = impt.__.inUnit;

    const refreshedTransfer = await this.transfersRepository.load(transferId);
    const { retryAttempts } = refreshedTransfer;

    switch (retryAttempts) {
      case maxAttempts:
        await this.failTransfer(error, refreshedTransfer, unitId);
        break;
      default:
        await this.retryTransfer(
          error,
          outerTransferFunction,
          impt,
          refreshedTransfer,
          attemptTimeDelay
        );
        break;
    }
  }

  private async failTransfer(
    error: Error,
    transfer: Transfer,
    unitId: number
  ): Promise<void> {
    const { id: transferId, log } = transfer;

    const failedTransfer = await this.transfersRepository.update({
      id: transferId,
      status: TransferState.FAILED,
      log: `Transfer was failed with error: ${error.message}`
    });
    this.io.to(String(unitId)).emit('transfer', failedTransfer);
  }

  private async retryTransfer(
    error: Error,
    outerTransferFunction: OuterTransferFunction,
    impt: SqlImport | ApiImport | EmailImport,
    transfer: Transfer,
    attemptTimeDelay: number
  ): Promise<void> {
    let { id: transferId, log, retryAttempts } = transfer;
    const { id: unitId } = impt.__.inUnit;
    retryAttempts++;

    const retriedTransfer = await this.transfersRepository.update({
      id: transferId,
      retryAttempts,
      log: `Transfer was failed with error: ${error.message}. Retrying transfer after ${attemptTimeDelay}ms. ${retryAttempts} retry attempts left.`
    });
    this.io.to(String(unitId)).emit('transfer', retriedTransfer);

    await sleep(attemptTimeDelay);
    await outerTransferFunction({
      import: impt,
      transfer: retriedTransfer
    });
  }
}
