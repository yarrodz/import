import TransfersRepository from '../../transfers/transfers.repository';

import SqlImport from '../interfaces/sql-import.interface';
import Transfer from '../../transfers/interfaces/transfer.interface';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import { TransferStatus } from '../../transfers/enums/transfer-status.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';

class SqlTransferHelper {
  private transfersRepository: TransfersRepository;

  constructor(transfersRepository: TransfersRepository) {
    this.transfersRepository = transfersRepository;
  }

  public async createStartedTransfer(impt: SqlImport): Promise<Transfer> {
    const { id: importId } = impt;
    const unit = impt.__.inUnit;
    const { id: unitId } = unit;

    return await this.transfersRepository.create({
      type: TransferType.IMPORT,
      method: TransferMethod.OFFSET_PAGINATION,
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

export default SqlTransferHelper;
