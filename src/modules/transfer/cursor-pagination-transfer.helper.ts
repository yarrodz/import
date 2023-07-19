import { Server as IO } from 'socket.io';

import TransferStepHelper from './transfer-step.helper';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportDocument } from '../imports/import.schema';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import ICursorPaginationFunction from './interfaces/cursor-pagination-function.interface';
import ICursorPagination from './interfaces/cursor-pagination.interface';

class CursorPaginationTransferHelper {
  private io: IO;
  private transferStepHelper: TransferStepHelper;
  private importProcessesRepository: ImportProcessesRepository;

  constructor(
    io: IO,
    transferStepHelper: TransferStepHelper,
    importProcessesRepository: ImportProcessesRepository
  ) {
    this.io = io;
    this.transferStepHelper = transferStepHelper;
    this.importProcessesRepository = importProcessesRepository;
  }

  public async cursorPaginationTransfer(
    impt: IImportDocument,
    processId: string,
    limit: number,
    cursorPaginationFunction: ICursorPaginationFunction,
    ...cursorPaginationFunctionParams: any[]
  ) {
    try {
      const { idColumn, datasetsCount, limitRequestsPerSecond } = impt;

      const prosess = await this.importProcessesRepository.findById(processId);
      let { processedDatasetsCount } = prosess;
      while (processedDatasetsCount < datasetsCount) {
        let requestCounter = 0;
        const startDate = new Date();

        while (requestCounter < limitRequestsPerSecond) {
          requestCounter++;
          const refreshedProcess =
            await this.importProcessesRepository.findById(processId);
          if (refreshedProcess.status === ImportStatus.PAUSED) {
            this.io
              .to(processId.toString())
              .emit('importProcess', refreshedProcess);
            return;
          }

          processedDatasetsCount = refreshedProcess.processedDatasetsCount;
          if (processedDatasetsCount >= datasetsCount) {
            break;
          }

          const cursorPagination: ICursorPagination = {
            cursor: refreshedProcess.cursor,
            limit
          };

          const { cursor, datasets } = await cursorPaginationFunction(
            cursorPagination,
            ...cursorPaginationFunctionParams
          );

          await this.transferStepHelper.transferStep(
            impt,
            processId,
            datasets,
            idColumn,
            cursor
          );

          if (!cursor || datasets.length === 0) {
            break;
          }
        }
        const endDate = new Date();
        const requestsExectionTime = endDate.getTime() - startDate.getTime();
        console.log('requestsExectionTime: ', requestsExectionTime);
        console.log('----------------');
        // If step executed faster than second. we have to wait for the remaining time so that there is a second in the sum
        if (requestsExectionTime < 1000) {
          const remainingToSecond = 1000 - requestsExectionTime;
          console.log('remainingToSecond: ', remainingToSecond);
          await this.sleep(remainingToSecond);
        }
      }
      
      const completedProcess = await this.importProcessesRepository.update(
        processId,
        {
          status: ImportStatus.COMPLETED,
          errorMessage: null
        }
      );
      this.io
        .to(processId.toString())
        .emit('importProcess', completedProcess);
    } catch (error) {
      console.error(`Error while cursor pagination transfer: ${error}`);
      const failedProcess = await this.importProcessesRepository.update(
        processId,
        {
          status: ImportStatus.FAILED,
          errorMessage: error.message
        }
      );
      this.io.to(processId.toString()).emit('importProcess', failedProcess);
    }
  }

  private async sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(undefined), time);
    });
  }
}

export default CursorPaginationTransferHelper;
