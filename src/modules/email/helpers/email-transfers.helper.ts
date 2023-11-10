import { EmailBaseTransferProcessHelper } from './email-base-transfer-process-helper';
import { TransferProcessHelper } from '../../transfer-processes/helpers/transfer-process.helper';
import { DatasetsRepository } from '../../datasets/datasets.repository';
import { ImapConnector } from '../connectors/imap.connector';
import { EmailImportTarget } from '../enums/email-import-target.enum';
import { EmailConnection } from '../interfaces/email-connection.interface';
import { PaginationType } from '../../transfer-processes/enums/pagination-type.enum';
import { TransformDatasetsHelper } from '../../datasets/helpers/transorm-datasets.helper';
import { saveDatasetsFunction } from '../../datasets/helpers/save-datasets.function';
import { fetchEmailsFunction } from '../callbacks/fetch-emails.callback';
import { fetchConversationsFunction } from '../callbacks/fetch-conversations.callback';
import { EmailIframeTransfer } from '../interfaces/email-iframe-transfer.interace';
import { TransferProcess } from '../../transfer-processes/interfaces/transfer-process.interface';
import { TransferCallbacks } from '../../transfer-processes/interfaces/transfer-callbacks.interface';
import { TransferParams } from '../../transfer-processes/interfaces/transfer-params.interace';
import { completeEmailTransferCondition } from '../callbacks/complete-transfer.callback';
import { FetchDatasetsCallback } from '../../transfer-processes/interfaces/callbacks/fetch-datasets-callback.interface';

export class EmailImportHelper {
  constructor(
    private emailBaseProcessHelper: EmailBaseTransferProcessHelper,
    private processHelper: TransferProcessHelper,
    private datasetsRepository: DatasetsRepository,
  ) {}

  public async doTransfer(
    transfer: EmailIframeTransfer,
    process: TransferProcess
  ): Promise<void> {
    try {
      const { mailbox, __: relations } = transfer;
      const connection = relations.connection as EmailConnection;
      const { config } = connection;
      var imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      await imapConnector.openMailbox(mailbox);

      if (process === undefined) {
        process = await this.emailBaseProcessHelper.baseProcess(
          transfer,
          imapConnector
        );
      }

      const params: TransferParams = this.createTransferParams(
        transfer,
        process,
        imapConnector
      );

      await this.processHelper.transfer(params);
      imapConnector.disconnect();
    } catch (error) {
      if (imapConnector !== undefined) {
        imapConnector.disconnect();
      }
    }
  };

  public async checkImport(
    connection: EmailConnection,
    transfer: EmailIframeTransfer
  ) {
    try {
      const { config } = connection;
      const { mailbox } = transfer;
      var imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      await imapConnector.openMailbox(mailbox);
      await imapConnector.testFetch();
      imapConnector.disconnect();
    } catch (error) {
      if (imapConnector !== undefined) {
        imapConnector.disconnect();
      }
      throw error;
    }
  }

  private createTransferParams(
    transfer: EmailIframeTransfer,
    process: TransferProcess,
    imapConnector: ImapConnector,
  ): TransferParams {
    const { 
      limitDatasetsPerRequest,
      limitRequestsPerSecond,
      __: relations
    } = transfer;
    const { unit } = relations;

    const callbacks = this.createTransferCallbacks(
      transfer,
      process,
      imapConnector
    )
    
    const params: TransferParams = {
      process,
      socketRoom: unit.id.toString(),
      paginationType: PaginationType.OFFSET,
      limitDatasetsPerRequest,
      limitRequestsPerSecond,
      callbacks,
      lastFetchedDatasets: []
    };

    return params;
  }

  private createTransferCallbacks(
    transfer: EmailIframeTransfer,
    process: TransferProcess,
    imapConnector: ImapConnector,
  ): TransferCallbacks {
    const fetchDatasets = this.createFetchDatasetsCallback(
      transfer,
      process,
      imapConnector
    )
    const transformDatasets = TransformDatasetsHelper.transformDatasets;
    const saveDatasets = saveDatasetsFunction(this.datasetsRepository);
    const completeCondition = completeEmailTransferCondition;

    const callbacks: TransferCallbacks = {
      fetchDatasets,
      transformDatasets,
      saveDatasets,
      completeCondition
    }

    return callbacks;
  }

  private createFetchDatasetsCallback(
    transfer: EmailIframeTransfer,
    process: TransferProcess,
    imapConnector: ImapConnector,
  ) {
    const { target } = transfer;
    const cases = {
      [EmailImportTarget.EMAILS]: this.createFetchEmailsCallback,
      [EmailImportTarget.CONVERSATIONS]: this.createFetchConversationsCallback
    }
    return cases[target](process, imapConnector);
  }

  private createFetchEmailsCallback(
    process: TransferProcess,
    imapConnector: ImapConnector
  ): FetchDatasetsCallback {
    return fetchEmailsFunction(process, imapConnector);
  }

  private createFetchConversationsCallback(
    process: TransferProcess,
    imapConnector: ImapConnector
  ): FetchDatasetsCallback {
    return fetchConversationsFunction(process, imapConnector);
  }
}
