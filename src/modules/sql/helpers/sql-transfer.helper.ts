import { TransfersRepository } from '../../transfers/transfers.repository';
import { SqlImport } from '../interfaces/sql-import.interface';
import { Transfer } from '../../transfers/interfaces/transfer.interface';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import { TransferStatus } from '../../transfers/enums/transfer-status.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';

export class SqlTransferHelper {
  private transfersRepository: TransfersRepository;

  constructor(transfersRepository: TransfersRepository) {
    this.transfersRepository = transfersRepository;
  }

  public async createTransfer(impt: SqlImport): Promise<Transfer> {
    const { id: importId } = impt;
    const unit = impt.__.inUnit;
    const { id: unitId } = unit;

    return await this.transfersRepository.create({
      type: TransferType.IMPORT,
      method: TransferMethod.OFFSET_PAGINATION,
      status: TransferStatus.PENDING,
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

  public async restartTransfer(id: number): Promise<Transfer> {
    return await this.transfersRepository.update({
      id,
      status: TransferStatus.PENDING,
      offset: 0,
      transferedDatasetsCount: 0,
      retryAttempts: 0,
      log: 'Transfer was restarted'
    });
  }
}
