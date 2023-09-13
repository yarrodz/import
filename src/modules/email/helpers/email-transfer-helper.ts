import { TransfersRepository } from '../../transfers/transfers.repository';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import { TransferState } from '../../transfers/enums/transfer-state.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import { EmailImport } from '../interfaces/email-import.interace';
import { Transfer } from '../../transfers/interfaces/transfer.interface';
import { EmailImportTarget } from '../enums/email-import-target.enum';

export class EmailTransferHelper {
  private transfersRepository: TransfersRepository;

  constructor(transfersRepository: TransfersRepository) {
    this.transfersRepository = transfersRepository;
  }

  public async createTransfer(impt: EmailImport): Promise<Transfer> {
    const { id: importId, target } = impt;
    const unit = impt.__.inUnit;
    const { id: unitId } = unit;

    return await this.transfersRepository.create({
      type: TransferType.IMPORT,
      method: TransferMethod.OFFSET_PAGINATION,
      status: TransferState.PENDING,
      offset: 0,
      transferedDatasetsCount: 0,
      log: 'Transfer was started',
      retryAttempts: 0,
      __: {
        inImport: {
          id: importId,
          _d: 'out'
        },
        inUnit: {
          id: unitId,
          _d: 'out'
        }
      }
    });
  }

  public async restartTransfer(
    id: number,
    target: EmailImportTarget
  ): Promise<Transfer> {
    return await this.transfersRepository.update({
      id,
      status: TransferState.PENDING,
      offset: target === EmailImportTarget.EMAILS ? 1 : 0,
      transferedDatasetsCount: 0,
      retryAttempts: 0,
      log: 'Transfer was restarted'
    });
  }
}
