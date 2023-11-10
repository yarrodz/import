import { TransferProcessesRepository } from '../transfer-processes.repository';
import { SocketHelper } from '../../sockets/socket.helper';
import { TransferStatus } from '../enums/transfer-status.enum';
import { TransferParams } from '../interfaces/transfer-params.interace';

export class TransferFailureHelper {
  constructor(
    private transferProcessesRepository: TransferProcessesRepository,
    private socketHelper: SocketHelper,
  ) {}

  public async handle(params: TransferParams, error: Error): Promise<void> {
    const { retryAttempts, maxRetryAttempts } = params.process;

    switch (retryAttempts) {
      case maxRetryAttempts:
        await this.failTransfer(params, error);
        break;
      default:
        await this.setRetryDate(params, error);
        break;
    }
  }

  private async failTransfer(params: TransferParams, error: Error): Promise<void> {
    let { process, socketRoom } = params;
    process = await this.transferProcessesRepository.update({
      id: process.id,
      status: TransferStatus.FAILED,
      log: `Transfer was failed with error: ${error.message}`
    });
    this.socketHelper.emit(socketRoom, 'transferProcess', process);
  }

  private async setRetryDate(params: TransferParams, error: Error): Promise<void> {
    let { process, socketRoom } = params;
    let { id, retryTimeDelay, retryAttempts, maxRetryAttempts } = process;

    retryAttempts++;
    
    const retryDate = new Date().getTime() + retryTimeDelay * 60;
    const remainingAttempts = maxRetryAttempts - retryAttempts;

    process = await this.transferProcessesRepository.update({
      id,
      retryAttempts,
      retryDate,
      log:
        'Transfer was failed with error:' + error.message + '. ' + 
        'Retrying transfer after ' + remainingAttempts +  'ms. ' +
         remainingAttempts + 'retry attempts left.'
    });
    this.socketHelper.emit(socketRoom, 'transferProcess', process);
  }
}
