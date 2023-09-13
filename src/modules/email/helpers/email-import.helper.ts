import { SearchObject } from 'imapflow';

import { TransferFailureHandler } from '../../transfers/helpers/transfer-failure-handler.helper';
import { OffsetPagination } from '../../transfers/interfaces/offset-pagination.interface';
import {
  OuterTransferFunction,
  OuterTransferFunctionParams
} from '../../transfers/interfaces/outer-transfer-function.interface';
import { Transfer } from '../../transfers/interfaces/transfer.interface';
import { TransfersRepository } from '../../transfers/transfers.repository';
import { ImapConnector } from '../connector/imap.connector';
import { EmailImportTarget } from '../enums/email-import-target.enum';
import { EmailConnection } from '../interfaces/email-connection.interface';
import { EmailImport } from '../interfaces/email-import.interace';
import { EmailPaginationHelper } from './email-pagination.helper';
import { EmailSearchObjectHelper } from './email-search-object.helper';
import { EmailTransferHelper } from './email-transfer-helper';
import { TransferParams } from '../../transfers/interfaces/transfer-params.interace';
import { PaginationType } from '../../transfers/enums/pagination-type.enum';
import { TransferHelper } from '../../transfers/helpers/transfer.helper';
import { DatasetsRepository } from '../../datasets/datasets.repository';
import { TransformDatasetsHelper } from '../../datasets/helpers/transform-datasets.helper';
import { FetchDatasetsFunction } from '../../transfers/interfaces/fetch-datasets-function.interface';
import { TransformDatasetsFunction } from '../../transfers/interfaces/transform-datasets-function.interface';
import { SaveDatasetsFunction } from '../../transfers/interfaces/save-datasets-function.interface';
import { Dataset } from '../../datasets/interfaces/dataset.interface';

export class EmailImportHelper {
  private emailTransferHelper: EmailTransferHelper;
  private transferHelper: TransferHelper;
  private transferFailureHandler: TransferFailureHandler;
  private transformDatasetsHelper: TransformDatasetsHelper;
  private transfersRepository: TransfersRepository;
  private datasetsRepository: DatasetsRepository;

  constructor(
    emailTransferHelper: EmailTransferHelper,
    transferHelper: TransferHelper,
    transferFailureHandler: TransferFailureHandler,
    transformDatasetsHelper: TransformDatasetsHelper,
    transefersRepository: TransfersRepository,
    datasetsRepository: DatasetsRepository
  ) {
    this.emailTransferHelper = emailTransferHelper;
    this.transferHelper = transferHelper;
    this.transferFailureHandler = transferFailureHandler;
    this.transformDatasetsHelper = transformDatasetsHelper;
    this.transfersRepository = transefersRepository;
    this.datasetsRepository = datasetsRepository;
  }

  public import: OuterTransferFunction = async (
    params: OuterTransferFunctionParams
  ): Promise<void> => {
    let imapConnector: ImapConnector;
    const import_ = params.import as EmailImport;
    const connection = import_.__.hasConnection as EmailConnection;
    const { mailbox, target } = import_;
    const { config } = connection;
    let { transfer } = params;
    try {
      if (transfer === undefined) {
        transfer = await this.emailTransferHelper.createTransfer(import_);
      }

      imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      await imapConnector.openMailbox(mailbox);

      switch (target) {
        case EmailImportTarget.EMAILS: {
          await this.emailImport(import_, transfer, imapConnector);
          break;
        }
        case EmailImportTarget.CONVERSATIONS: {
          await this.conversationImport(import_, transfer, imapConnector);
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
        import: import_,
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
      const range = EmailPaginationHelper.createRange({
        offset: 0,
        limit: 1
      });
      const searchObject: SearchObject = {};
      await imapConnector.getEmails(range, searchObject);
    } catch (error) {
      imapConnector && imapConnector.disconnect();
      throw error;
    }
  }

  private async emailImport(
    import_: EmailImport,
    transfer: Transfer,
    imapConnector: ImapConnector
  ) {
    const { id: transferId } = transfer;
    const { limit, filter, setSeen } = import_;

    if (transfer.references === undefined) {
      const searchObject = EmailSearchObjectHelper.fromFilter(filter);
      const uids = await imapConnector.getUids(searchObject);

      transfer = await this.transfersRepository.update({
        id: transferId,
        references: uids,
        total: uids.length
      });
    }

    const { references: uids } = transfer;

    const fetchFunction = this.createEmailsFetchFunction(imapConnector, uids);
    const transformFunction = this.createTransformFunction(import_);
    const saveFunction = this.createSaveFunction();

    const transferParams: TransferParams = {
      process: import_,
      transfer,
      limitDatasetsPerStep: limit,
      paginationType: PaginationType.OFFSET,
      useReferences: true,
      fetchFunction,
      transformFunction,
      saveFunction
    };

    await this.transferHelper.transfer(transferParams);

    if (setSeen) {
      await imapConnector.setSeen(uids.join(','));
    }
  }

  private async conversationImport(
    import_: EmailImport,
    transfer: Transfer,
    imapConnector: ImapConnector
  ) {
    const { id: transferId } = transfer;
    const { limit, filter, setSeen } = import_;

    if (transfer.references === undefined) {
      const searchObject = EmailSearchObjectHelper.fromFilter(filter);
      const threadIds = await imapConnector.getThreadIds(searchObject);

      transfer = await this.transfersRepository.update({
        id: transferId,
        references: threadIds,
        total: threadIds.length
      });
    }

    const { references: threadIds } = transfer;

    const fetchFunction = this.createConversationFetchFunction(
      imapConnector,
      threadIds,
      setSeen
    );
    const transformFunction = this.createTransformFunction(import_);
    const saveFunction = this.createSaveFunction();

    const transferParams: TransferParams = {
      process: import_,
      transfer,
      paginationType: PaginationType.OFFSET,
      useReferences: true,
      limitDatasetsPerStep: limit,
      fetchFunction,
      transformFunction,
      saveFunction
    };

    await this.transferHelper.transfer(transferParams);
  }

  private createEmailsFetchFunction(
    imapConnector: ImapConnector,
    uids: number[]
  ): FetchDatasetsFunction {
    return async function (pagination: OffsetPagination) {
      const range = EmailPaginationHelper.createUidRange(pagination, uids);
      const emails = await imapConnector.getEmails(range, {});

      return { datasets: emails };
    };
  }

  private createConversationFetchFunction(
    imapConnector: ImapConnector,
    threadIds: string[],
    setSeen: boolean
  ): FetchDatasetsFunction {
    return async function (pagination: OffsetPagination) {
      const { offset, limit } = pagination;
      const range = threadIds.slice(offset, limit);

      const conversations = await Promise.all(
        range.map(async (threadId) => {
          const searchObject = EmailSearchObjectHelper.fromFilter({ threadId });
          const emails = await imapConnector.getEmails('1:*', searchObject);

          const conversation = emails
            .sort((a, b) => b.date?.getTime() - a.date?.getTime())
            .map(({ messageId, inReplyTo, from, to, cc, bcc, date, text }) => {
              return {
                messageId,
                inReplyTo,
                date,
                from,
                to,
                cc,
                bcc,
                text
              };
            });

          const date = conversation[0]?.date;

          if (setSeen === true) {
            await imapConnector.setSeen(emails.map(({ uid }) => uid).join(','));
          }

          return {
            threadId,
            conversation,
            date
          };
        })
      );

      return { datasets: conversations };
    };
  }

  private createTransformFunction(
    import_: EmailImport
  ): TransformDatasetsFunction {
    const self = this;

    return function (datasets: object[]) {
      return self.transformDatasetsHelper.transform(datasets, import_);
    };
  }

  private createSaveFunction(): SaveDatasetsFunction {
    const self = this;

    return function (datasets: Dataset[]) {
      return self.datasetsRepository.bulkSave(datasets);
    };
  }
}
