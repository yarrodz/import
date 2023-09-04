import ChunkTransferHelper from '../../transfers/helpers/chunk-transfer.helper';
import OffsetPaginationTransferHelper from '../../transfers/helpers/offset-pagination-transfer.helper';
import TransferFailureHandler from '../../transfers/helpers/transfer-failure-handler.helper';
import ChunkTransferParams from '../../transfers/interfaces/chunk-transfer-params.interface';
import OffsetPaginationFunction from '../../transfers/interfaces/offset-pagination-function.interface';
import OffsetPaginationTransferParams from '../../transfers/interfaces/offset-pagination-transfer-params.interface';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import OuterTransferFunction, {
  OuterTransferFunctionParams
} from '../../transfers/interfaces/outer-transfer-function.interface';
import Transfer from '../../transfers/interfaces/transfer.interface';
import TransfersRepository from '../../transfers/transfers.repository';
import { ImapConnector } from '../connector/imap.connector';
import { EmailImportTarget } from '../enums/email-import-target.enum';
import EmailConnection from '../interfaces/email-connection.interface';
import EmailImport from '../interfaces/email-import.interace';
import EmailTransferHelper from './email-transfer-helper';

class EmailImportHelper {
  private emailTransferHelper: EmailTransferHelper;
  private transferFailureHandler: TransferFailureHandler;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;
  private chunkTransferHelper: ChunkTransferHelper;
  private transfersRepository: TransfersRepository;

  constructor(
    emailTransferHelper: EmailTransferHelper,
    transferFailureHandler: TransferFailureHandler,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
    chunkTransferHelper: ChunkTransferHelper,
    transefersRepository: TransfersRepository
  ) {
    this.emailTransferHelper = emailTransferHelper;
    this.transferFailureHandler = transferFailureHandler;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    this.chunkTransferHelper = chunkTransferHelper;
    this.transfersRepository = transefersRepository;
  }

  public import: OuterTransferFunction = async (
    params: OuterTransferFunctionParams
  ): Promise<void> => {
    let imapConnector: ImapConnector;
    const impt = params.import as EmailImport;
    const connection = impt.__.hasConnection as EmailConnection;
    const { mailbox, target } = impt;
    const { config } = connection;
    let { transfer } = params;
    try {
      if (transfer === undefined) {
        transfer = await this.emailTransferHelper.createStartedTransfer(impt);
      }

      imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      await imapConnector.openMailbox(mailbox);

      switch (target) {
        case EmailImportTarget.EMAILS: {
          await this.emailImport(impt, transfer, imapConnector);
          break;
        }
        case EmailImportTarget.CONVERSATIONS: {
          await this.conversationImport(impt, transfer, imapConnector);
          break;
        }
        default: {
          throw new Error(`Unknown email import target: ${target}.`);
        }
      }

      imapConnector.disconnect();
    } catch (error) {
      imapConnector && imapConnector.disconnect();

      this.transferFailureHandler.handle({
        error,
        outerTransferFunction: this.import,
        import: impt,
        transfer
      });
    }
  };

  public async checkImport(connection: EmailConnection, impt: EmailImport) {
    let imapConnector: ImapConnector;
    try {
      const { config } = connection;
      const { mailbox } = impt;
      imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      await imapConnector.openMailbox(mailbox);
      await imapConnector.getEmails(0, 1);
    } catch (error) {
      imapConnector && imapConnector.disconnect();
      throw error;
    }
  }

  private async emailImport(
    impt: EmailImport,
    transfer: Transfer,
    imapConnector: ImapConnector
  ) {
    const { limit } = impt;

    const offsetPaginationTransferParams: OffsetPaginationTransferParams = {
      import: impt,
      transfer,
      limitPerStep: limit,
      paginationFunction: {
        fn: this.paginationFunction,
        params: [imapConnector]
      }
    };

    await this.offsetPaginationTransferHelper.transfer(
      offsetPaginationTransferParams
    );
  }

  private async conversationImport(
    impt: EmailImport,
    transfer: Transfer,
    imapConnector: ImapConnector
  ) {
    const { id: transferId } = transfer;

    if (transfer.references === undefined) {
      const threadIds = await imapConnector.getThreadIds();
      transfer = await this.transfersRepository.update({
        id: transferId,
        references: threadIds
      });
    }

    const { references: threadIds } = transfer;

    const datasets = await Promise.all(
      threadIds.map(async (threadId) => {
        const emails = await imapConnector.getEmailsByThredId(threadId);

        const conversation = emails
          .sort((a, b) => b.date?.getTime() - a.date?.getTime())
          .map(({ from, to, date, text }) => {
            return { from, to, date, text };
          });

        const date = conversation[0].date;

        return {
          threadId,
          date,
          conversation
        };
      })
    );

    const chunkTransferParams: ChunkTransferParams = {
      import: impt,
      transfer,
      datasets,
      chunkLength: 10
    };

    await this.chunkTransferHelper.transfer(chunkTransferParams);
  }

  private paginationFunction: OffsetPaginationFunction = async (
    offsetPagination: OffsetPagination,
    imapConnector: ImapConnector
  ) => {
    const { offset, limit } = offsetPagination;
    return await imapConnector.getEmails(offset, limit);
  };
}

export default EmailImportHelper;
