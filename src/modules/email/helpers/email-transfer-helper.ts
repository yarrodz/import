import TransfersRepository from '../../transfers/transfers.repository';

import { TransferType } from '../../transfers/enums/transfer-type.enum';
import { TransferStatus } from '../../transfers/enums/transfer-status.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import EmailImport from '../interfaces/email-import.interace';
import Transfer from '../../transfers/interfaces/transfer.interface';

class EmailTransferHelper {
  private transfersRepository: TransfersRepository;

  constructor(transfersRepository: TransfersRepository) {
    this.transfersRepository = transfersRepository;
  }

  public async createStartedTransfer(impt: EmailImport): Promise<Transfer> {
    const { id: importId } = impt;
    const unit = impt.__.inUnit;
    const { id: unitId } = unit;

    return await this.transfersRepository.create({
      type: TransferType.IMPORT,
      method: TransferMethod.OFFSET_PAGINATION,
      status: TransferStatus.PENDING,
      offset: 1,
      transferedDatasetsCount: 0,
      log: '',
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
}

export default EmailTransferHelper;
