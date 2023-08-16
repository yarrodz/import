import { Server as IO } from 'socket.io';

import TransfersRepository from '../transfers.repository';
import OuterTransferFunction from '../interfaces/outer-transfer-function.interface';
import Transfer from '../interfaces/transfer.interface';
import { TransferStatus } from '../enums/transfer-status.enum';
import sleep from '../../../utils/sleep/sleep';
import TransferFailureHandleParams from '../interfaces/transfer-failure-handle-params.interface';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import ApiImport from '../../api/interfaces/api-import.interface';

class TransferFailureHandler {
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

    const refreshedTransfer = await this.transfersRepository.get(transferId);
    const { retryAttempts } = refreshedTransfer;

    switch (retryAttempts) {
      case maxAttempts:
        await this.failTransfer(error, refreshedTransfer);
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

  private async failTransfer(error: Error, transfer: Transfer): Promise<void> {
    const { id: transferId, log } = transfer;

    log.push(`Transfer was failed with error: ${error.message}`);

    const failedTransfer = await this.transfersRepository.update({
      id: transferId,
      status: TransferStatus.FAILED,
      log
    });
    this.io.to(String(transferId)).emit('transfer', failedTransfer);
  }

  private async retryTransfer(
    error: Error,
    outerTransferFunction: OuterTransferFunction,
    impt: SqlImport | ApiImport,
    transfer: Transfer,
    attemptTimeDelay: number
  ): Promise<void> {
    let { id: transferId, log, retryAttempts } = transfer;
    retryAttempts++;

    log.push(
      `Transfer was failed with error: ${error.message}. Retrying transfer after ${attemptTimeDelay}ms. ${retryAttempts} retry attempts left.`
    );

    const retriedTransfer = await this.transfersRepository.update({
      id: transferId,
      retryAttempts
    });
    this.io.to(String(transferId)).emit('transfer', retriedTransfer);

    await sleep(attemptTimeDelay);
    await outerTransferFunction({
      import: impt,
      transfer: retriedTransfer
    });
  }
}

export default TransferFailureHandler;
