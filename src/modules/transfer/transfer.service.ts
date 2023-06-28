import { Server as IO } from 'socket.io';

import { IImportDocument } from '../imports/import.schema';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import TransferSQLService from './transfers/transfer-sql.service';
import { ImportSource } from '../imports/enums/import-source.enum';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import TransferAPIService from './transfers/transfer-api.service';

class TransferService {
  private io: IO;
  private importProcessesRepository: ImportProcessesRepository;
  private transferSQLService: TransferSQLService;
  private transferAPIService: TransferAPIService;
  private maxAttempts: number;
  private attemptDelayTime: number;
  private limit: number;

  constructor(
    io: IO,
    importProcessesRepository: ImportProcessesRepository,
    transferSQLService: TransferSQLService,
    transferAPIService: TransferAPIService,
    maxAttempts: number,
    attemptDelayTime: number,
    limit: number
  ) {
    (this.io = io),
      (this.importProcessesRepository = importProcessesRepository);
    this.transferSQLService = transferSQLService;
    this.transferAPIService = transferAPIService;
    this.maxAttempts = maxAttempts;
    this.attemptDelayTime = attemptDelayTime;
    this.limit = limit;
  }

  public async transfer(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    try {
      await this.run(impt, process);
    } catch (error) {
      return this.handleTranserFailure(error, impt, process);
    }
  }

  private async run(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        await this.transferSQLService.transfer(impt, process, this.limit);
        break;
      case ImportSource.API:
        await this.transferAPIService.transfer(impt, process, this.limit);
        break;
      // case ImportSource.IMAP:
      //   await imapImport(impt, processId);
      //   break;
      default:
        throw new Error('Unexpected import source');
    }
  }

  private async handleTranserFailure(
    error: Error,
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    const refreshedProcess = await this.importProcessesRepository.findById(
      process._id
    );
    switch (refreshedProcess.attempts) {
      case this.maxAttempts:
        await this.failTransferProcess(error, process);
        break;
      default:
        await this.retryTransferProcess(impt, process);
        break;
    }
  }

  private async failTransferProcess(
    error: Error,
    process: IImportProcessDocument
  ): Promise<void> {
    const failedProcess = await this.importProcessesRepository.update(
      process._id,
      {
        status: ImportStatus.FAILED,
        errorMessage: error.message
      }
    );
    this.io.to(process._id.toString()).emit('importProcess', failedProcess);
  }

  private async retryTransferProcess(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    await this.importProcessesRepository.update(process._id, {
      $inc: { attempts: 1 }
    });
    await this.delayAttempt();
    return await this.transfer(impt, process);
  }

  private async delayAttempt(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(undefined), this.attemptDelayTime);
    });
  }

  // private async transferApi(
  //   impt: IImportDocument,
  //   processId: string
  // ) {
  //   const requestConfig = impt.api.requestConfig;
  //   const idColumn = impt.api.idColumn;
  //   const path = impt.api.path;
  //   const data = await axios(requestConfig);
  //   let retrievedDatasets = this.resolvePath(data, path) as object[];
  //   const process = await this.importProcessesRepository.update(processId, {
  //     datasetsCount: retrievedDatasets.length
  //   });
  //   const { processedDatasetsCount } = process;
  //   let datasetsToImport = retrievedDatasets.slice(
  //     processedDatasetsCount,
  //     retrievedDatasets.length
  //   );
  //   let chunkedDatasets = JSON.parse(
  //     JSON.stringify(this.chunkArray(datasetsToImport, LIMIT))
  //   ) as object[][];
  //   retrievedDatasets = null;
  //   datasetsToImport = null;
  //   await this.transferHelper.chunkTransfer(chunkedDatasets, impt, processId, idColumn);
  // }

  // private chunkArray(array: object[], chunkSize: number): object[][] {
  //   const chunkedArray = [];
  //   for (let i = 0; i < array.length; i += chunkSize) {
  //     const chunk = array.slice(i, i + chunkSize);
  //     chunkedArray.push(chunk);
  //   }
  //   return chunkedArray;
  // }

  // private resolvePath(obj: object, path: string) {
  //   const props = path.split('.');
  //   let current = obj;
  //   for (const prop of props) {
  //     current = current[prop];
  //   }
  //   return current;
  // }

  // private async transferImap(
  //   impt: IImportDocument,
  //   processId: string
  // ) {
  //   let imapConnection: ImapConnection;
  //   try {
  //     const idColumn = 'messageId';
  //     const connection = impt.imap.connection;
  //     imapConnection = new ImapConnection(connection);
  //     await imapConnection.connect();
  //     const rawEmails = await imapConnection.receiveEmails();
  //     let parsedEmails = await this.parseEmails(rawEmails);
  //     imapConnection.disconnect();
  //     const process = await this.importProcessesRepository.update(processId, {
  //       datasetsCount: parsedEmails.length
  //     });
  //     const { processedDatasetsCount } = process;
  //     let emailesToImport = parsedEmails.slice(
  //       processedDatasetsCount,
  //       parsedEmails.length
  //     );
  //     const chunkedEmails = JSON.parse(
  //       JSON.stringify(this.chunkArray(emailesToImport, LIMIT))
  //     ) as object[][];
  //     parsedEmails = null;
  //     emailesToImport = null;
  //     await this.transferHelper.chunkTransfer(chunkedEmails, impt, processId, idColumn);
  //   } catch (error) {
  //     imapConnection.disconnect();
  //     throw error;
  //   }
  // }

  // private async parseEmails(emails: string[]): Promise<ParsedMail[]> {
  //   return await Promise.all(
  //     emails.map(async (email) => {
  //       return await simpleParser(email);
  //     })
  //   );
  // }
}

export default TransferService;
