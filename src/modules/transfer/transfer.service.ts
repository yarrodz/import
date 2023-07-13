import { Server as IO } from 'socket.io';

import { IImportDocument } from '../imports/import.schema';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import SqlTranserService from '../database/sql-transfer.service';
import { ImportSource } from '../imports/enums/import-source.enum';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import ApiTransferService from '../api/api-transfer.service';

class TransferService {
  private io: IO;
  private importProcessesRepository: ImportProcessesRepository;
  private sqlTranserService: SqlTranserService;
  private apiTransferService: ApiTransferService;
  private maxAttempts: number;
  private attemptDelayTime: number;

  constructor(
    io: IO,
    importProcessesRepository: ImportProcessesRepository,
    sqlTranserService: SqlTranserService,
    apiTransferService: ApiTransferService,
    maxAttempts: number,
    attemptDelayTime: number
  ) {
    (this.io = io),
      (this.importProcessesRepository = importProcessesRepository);
    this.sqlTranserService = sqlTranserService;
    this.apiTransferService = apiTransferService;
    this.maxAttempts = maxAttempts;
    this.attemptDelayTime = attemptDelayTime;
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
        await this.sqlTranserService.transfer(impt, process);
        break;
      case ImportSource.API:
        await this.apiTransferService.transfer(impt, process);
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
    console.log(error);
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
}

export default TransferService;
