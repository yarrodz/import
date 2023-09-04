import TransfersRepository from '../../transfers/transfers.repository';

import ApiImport from '../interfaces/api-import.interface';
import Transfer from '../../transfers/interfaces/transfer.interface';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import { TransferStatus } from '../../transfers/enums/transfer-status.enum';

class ApiTransferHelper {
  private transfersRepository: TransfersRepository;

  constructor(transfersRepository: TransfersRepository) {
    this.transfersRepository = transfersRepository;
  }

  public async createStartedTransfer(impt: ApiImport): Promise<Transfer> {
    const { id: importId } = impt;
    const { transferMethod } = impt;
    const unit = impt.__.inUnit;
    const { id: unitId } = unit;

    return await this.transfersRepository.create({
      type: TransferType.IMPORT,
      method: transferMethod,
      status: TransferStatus.PENDING,
      offset: 0,
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

export default ApiTransferHelper;
