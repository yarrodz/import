import { Server as IO } from 'socket.io';

import TransferStepHelper from './transfer-step.helper';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportDocument } from '../imports/import.schema';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import IOffsetPagination from './interfaces/offset-pagination.interface';
import IOffsetPaginationFunction from './interfaces/offset-pagination-function.interface';
import sleep from '../../utils/sleep/sleep';

class OffsetPaginationTransferHelper {
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

  public async offsetPaginationTransfer(
    impt: IImportDocument,
    processId: string,
    limit: number,
    offsetPaginationFunction: IOffsetPaginationFunction,
    ...offsetPaginationFunctionParams: any[]
  ) {
    const { limitRequestsPerSecond } = impt;

    const prosess = await this.importProcessesRepository.findById(processId);
    let { processedDatasetsCount: offset, datasetsCount } = prosess;

    while (offset < datasetsCount) {
      let requestCounter = 0;
      const startDate = new Date();

      while (requestCounter < limitRequestsPerSecond) {
        requestCounter++;
        const refreshedProcess = await this.importProcessesRepository.findById(
          processId
        );
        if (refreshedProcess.status === ImportStatus.PAUSED) {
          this.io
            .to(processId.toString())
            .emit('importProcess', refreshedProcess);
          return;
        }

        const offsetPagination: IOffsetPagination = {
          offset,
          limit
        };
        const datasets = await offsetPaginationFunction(
          offsetPagination,
          ...offsetPaginationFunctionParams
        );

        if (datasets.length === 0) {
          break;
        }

        await this.transferStepHelper.transferStep(impt, processId, datasets);

        offset += limit;
      }
      //If step executed faster than second. we have to wait for the remaining time so that there is a second in the sum
      const endDate = new Date();
      const requestsExectionTime = endDate.getTime() - startDate.getTime();
      // console.log('requestsExectionTime: ', requestsExectionTime);
      // console.log('offset: ', offset);
      // console.log('----------------');
      if (requestsExectionTime < 1000) {
        const remainingToSecond = 1000 - requestsExectionTime;
        // console.log('remainingToSecond: ', remainingToSecond);
        await sleep(remainingToSecond);
      }
    }

    const completedProcess = await this.importProcessesRepository.update(
      processId,
      {
        status: ImportStatus.COMPLETED,
        errorMessage: null
      }
    );
    this.io.to(processId.toString()).emit('importProcess', completedProcess);
  }
}

export default OffsetPaginationTransferHelper;
