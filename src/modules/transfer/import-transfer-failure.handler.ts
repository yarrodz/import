import { Server as IO } from 'socket.io';

import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportDocument } from '../imports/import.schema';
import IImportTransferFunction from './interfaces/import-transfer-function.interface';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import sleep from '../../utils/sleep/sleep';
import { IImportProcessDocument } from '../import-processes/import-process.schema';

class ImportTransferFailureHandler {
  private io: IO;
  private importProcessesRepository: ImportProcessesRepository;
  private maxAttempts: number;
  private attemptDelayTime: number;

  constructor(
    io: IO,
    importProcessesRepository: ImportProcessesRepository,
    maxAttempts: number,
    attemptDelayTime: number
  ) {
    this.io = io;
    this.importProcessesRepository = importProcessesRepository;
    this.maxAttempts = maxAttempts;
    this.attemptDelayTime = attemptDelayTime;
  }

  public async handle(
    error: Error,
    importTransferFunction: IImportTransferFunction,
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    const { _id: processId } = process;
    const refreshedProcess = await this.importProcessesRepository.findById(
      processId
    );
    const { attempts } = refreshedProcess;

    switch (attempts) {
      case this.maxAttempts:
        await this.failImportTransfer(error, processId);
        break;
      default:
        await this.retryImportTransfer(
          importTransferFunction,
          impt,
          refreshedProcess
        );
        break;
    }
  }

  private async failImportTransfer(
    error: Error,
    processId: string
  ): Promise<void> {
    const failedProcess = await this.importProcessesRepository.update(
      processId,
      {
        status: ImportStatus.FAILED,
        errorMessage: error.message
      }
    );
    this.io.to(processId.toString()).emit('importProcess', failedProcess);
  }

  private async retryImportTransfer(
    importTransferFunction: IImportTransferFunction,
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    const { _id: processId } = process;
    await this.importProcessesRepository.update(processId, {
      $inc: { attempts: 1 }
    });
    await sleep(this.attemptDelayTime);
    await importTransferFunction(impt, process);
  }
}

export default ImportTransferFailureHandler;
