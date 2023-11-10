import { TransferProcessesRepository } from '../transfer-processes.repository';
import { TransferFailureHelper } from './transfer-failure.helper';
import { SocketHelper } from '../../sockets/socket.helper';
import { TransferParams } from '../interfaces/transfer-params.interace';
import { TransferStatus } from '../enums/transfer-status.enum';  
import { PaginationType } from '../enums/pagination-type.enum';
import { Pagination } from '../interfaces/pagination.type';

export class TransferProcessHelper {
  constructor(
    private transferProcessesRepository: TransferProcessesRepository,
    private transferFailureHelper: TransferFailureHelper,
    private socketHelper: SocketHelper
  ) {}

  public async transfer(params: TransferParams) {
    try {
      let stepsCount = 0;
      let maxStepsCount = 10000;

      const { limitDatasetsPerRequest: limit, process } = params;
      const { total, offset } = process;
      if (total !== undefined) {
        maxStepsCount = Math.ceil((total - offset) / limit);
      }

      params.break = false;
      while (stepsCount < maxStepsCount) {
        // @ts-ignore - ts say that it is can't be true.
        if (params.break === true) { 
          return;
        }

        const madeStepsCount = await this.intervalStepsExec(params);
        stepsCount += madeStepsCount;
      }

      await this.failProcess(params);
    } catch (error) {
      this.transferFailureHelper.handle(params, error);
    }
  }

  private async intervalStepsExec(params: TransferParams) {
    const { limitRequestsPerSecond: limit } = params;
    let stepsCount = 0;
    let sumStepsTime = 0;

    while (stepsCount < limit && sumStepsTime < 1000) {
      if (params.break === true) {
        return;
      }

      const stepStart = new Date();
      await this.step(params);
      const stepEnd = new Date();

      stepsCount++;
      sumStepsTime += this.msBetween(stepStart, stepEnd);
    }

    if (sumStepsTime < 1000) {
      const remainingToSecond = 1000 - sumStepsTime;
      await this.sleep(remainingToSecond);
    }

    return stepsCount;
  }

  private msBetween(start: Date, finish: Date) {
    return start.getTime() - finish.getTime();
  }

  private async sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private async step(params: TransferParams) {
    const { process, callbacks } = params;
    const {
      fetchDatasets,
      transformDatasets,
      saveDatasets,
      completeCondition
    } = callbacks;

    if (process.status === TransferStatus.PAUSING) {
      await this.pauseProcess(params);
      params.break = true;
      return;
    }

    const pagination = this.createPagination(params);
    const { datasets, cursor } = await fetchDatasets(pagination);
    params.lastFetchedDatasets = datasets;

    const transformedDatasets = await transformDatasets(datasets);

    await saveDatasets(transformedDatasets);

    await this.afterStepProcessUpdate(
      params,
      cursor,
      transformedDatasets.length
    );
    
    if (await completeCondition(params) === true) {
      await this.comleteProcess(params);
      params.break = true;
      return;
    }
  }

  private createPagination(params: TransferParams): Pagination {
    const { paginationType } = params;
    
    const cases = {
      [PaginationType.OFFSET]: this.createOffsetPagination,
      [PaginationType.CURSOR]: this.createCursorPagination
    };

    return cases[paginationType](params);
  }

  private createOffsetPagination(params: TransferParams) {
    const { process, limitDatasetsPerRequest: limit } = params;
    const { offset } = process;
    return{ offset, limit };
  }

  private createCursorPagination(params: TransferParams) {
    const { process, limitDatasetsPerRequest: limit } = params;
    const { cursor } = process;
    return{ cursor, limit };
  }

  private async pauseProcess(params: TransferParams) {
    const { id } = params.process;
    params.process = await this.transferProcessesRepository.update({
      id,
      status: TransferStatus.PAUSED
    });
    this.emitProcess(params);
  }

  private async afterStepProcessUpdate(
    params: TransferParams,
    cursor: string,
    transfromed: number
  ) {
    const { process, limitDatasetsPerRequest: limit } = params;
    const { id, offset, transfered } = process;
    params.process = await this.transferProcessesRepository.update({
      id,
      offset: offset + limit,
      cursor,
      transfered: transfered + transfromed,
      retryAttempts: 0
    });
    this.emitProcess(params);
  }

  private async comleteProcess(params: TransferParams) {
    const { id } = params.process;
    params.process = await this.transferProcessesRepository.update({
      id,
      status: TransferStatus.COMPLETED,
      log: 'Transfer succesfully completed.'
    });
    this.emitProcess(params);
  }

  private async failProcess(params: TransferParams) {
    const { id } = params.process;
    params.process = await this.transferProcessesRepository.update({
      id,
      status: TransferStatus.FAILED,
      log: 'Transfer was failed due max steps count.'
    });
    this.emitProcess(params);
  }

  private emitProcess(params: TransferParams) {
    const { socketRoom, process } = params;
    this.socketHelper.emit(
      socketRoom,
      'transferProcess',
      process
    );
  }
}
