import { TransferProcessesRepository } from '../../transfer-processes/transfer-processes.repository';
import { EmailIframeTransfer } from '../interfaces/email-iframe-transfer.interace';
import { ImapConnector } from '../connectors/imap.connector';
import { TransferProcess } from '../../transfer-processes/interfaces/transfer-process.interface';
import { TransferStatus } from '../../transfer-processes/enums/transfer-status.enum';
import { EmailImportTarget } from '../enums/email-import-target.enum';
import { EmailSearchObjectHelper } from './email-search-object.helper';

export class EmailBaseTransferProcessHelper {
  constructor(
    private transferProcessesRepository: TransferProcessesRepository  
  ) {}

  public async baseProcess(
    transfer: EmailIframeTransfer,
    imapConnector: ImapConnector
  ): Promise<TransferProcess>  {
    const { total, helper } = await this.createParams(transfer, imapConnector);
    const relations = this.createProcessRelations(transfer);
    return await this.transferProcessesRepository.create({
      status: TransferStatus.PENDING,
      log: 'Transfer was started.',
      offset: 0,
      transfered: 0,
      total,
      helper,
      retryAttempts: 0,
      __: relations
    });
  }

  private async createParams(
    transfer: EmailIframeTransfer,
    imapConnector: ImapConnector
  ) {
    const { target } = transfer;
    if (target === EmailImportTarget.EMAILS) {
      const uids = await this.fetchUids(transfer, imapConnector);
      return  {
        total: uids.length,
        helper: { uids }
      }
    }
    const threadIds = await this.fetchThreadIds(transfer, imapConnector);
    return {
      total: threadIds.length,
      helper: { threadIds }
    }
  }

  private async fetchUids(
    transfer: EmailIframeTransfer,
    imapConnector: ImapConnector
  ) {
    const { filter } = transfer;
    const searchObject = EmailSearchObjectHelper.fromFilter(filter);
    return await imapConnector.fetchUids(searchObject);
  }

  private async fetchThreadIds(
    transfer: EmailIframeTransfer,
    imapConnector: ImapConnector
  ) {
    const { filter } = transfer;
    const searchObject = EmailSearchObjectHelper.fromFilter(filter);
    return await imapConnector.fetchThreadIds(searchObject);
  }
    
  private createProcessRelations(
      transfer: EmailIframeTransfer,
    ) {
      const { id: transferId, __: relations } = transfer;
      const { id: unitId } = relations.unit;
      return {
        transfer: {
          id: transferId,
          _d: 'out'
        },
        unit: {
          id: unitId,
          _d: 'out'
        }
      }
    }
}
