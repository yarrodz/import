import { Request } from 'express';
import { iFrameTransfer } from 'iframe-ai';

import ResponseHandler from '../../utils/response-handler/response-handler';
import SqlSynchronizationService from '../sql/sql-synchronization.service';
import ApiSynchronizationService from '../api/api-synchronization.service';
import dbClient from '../../utils/db-client/db-client';
import { TransferStatus } from './enums/transfer-status.enum';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';
import { SynchronizationSource } from '../synchronizations/enums/synchronization-source.enum';

class TransfersService {
  private sqlSynchronizationService: SqlSynchronizationService;
  private apiSynchronizationService: ApiSynchronizationService;

  constructor(
    sqlSynchronizationService: SqlSynchronizationService,
    apiSynchronizationService: ApiSynchronizationService
  ) {
    this.sqlSynchronizationService = sqlSynchronizationService;
    this.apiSynchronizationService = apiSynchronizationService;
  }

  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      // const processes = await this.importProcessesRepository.findAll(unit);
      responseHandler.setSuccess(200, 'processes');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      // let transfer =
      //   const process = await this.importProcessesRepository.findById(id);
      //   if (!process) {
      //     responseHandler.setError(404, 'Import process not found');
      //     return responseHandler;
      //   }

      //   if (process.status === ImportStatus.PENDING) {
      //     responseHandler.setError(
      //       409,
      //       'Pending import process cannot be deleted'
      //     );
      //     return responseHandler;
      //   }

      //   await this.importProcessesRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async pause(id: number) {
    const responseHandler = new ResponseHandler();
    try {
      await new iFrameTransfer(
        dbClient,
        { status: TransferStatus.PAUSED },
        id
      ).save();

      //   const process = await this.importProcessesRepository.findById(id);
      //   if (!process) {
      //     responseHandler.setError(404, 'Import process not found');
      //     return responseHandler;
      //   }

      //   if (process.status !== ImportStatus.PENDING) {
      //     responseHandler.setError(
      //       409,
      //       'Only pending import process can be paused'
      //     );
      //     return responseHandler;
      //   }

      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(req: Request, id: string) {
    const responseHandler = new ResponseHandler();
    try {
      //   const process = await this.importProcessesRepository.findById(id);
      //   if (!process) {
      // responseHandler.setError(404, 'Import process not found');
      // return responseHandler;
      //   }

      //   if (process.status !== ImportStatus.PAUSED) {
      // responseHandler.setError(
      //   409,
      //   'Only paused import process can be reloaded'
      // );
      // return responseHandler;
      //   }

      //   const impt = await this.importsRepository.findById(
      //     process.import.toString()
      //   );
      //   if (!impt) {
      //     responseHandler.setError(404, 'Import not found');
      //     return responseHandler;
      //   }

      //   const pendingImport =
      //     await this.importProcessesRepository.findPendingByUnit(
      //       impt.unit as string
      //     );
      //   if (pendingImport) {
      //     responseHandler.setError(
      //       409,
      //       'This unit is currently processing another import'
      //     );
      //     return responseHandler;
      //   }

      let transfer = await new iFrameTransfer(
        dbClient,
        { status: TransferStatus.PENDING },
        id
      ).save();
      let synchronization = await transfer.getSynchronization();

      transfer = transformIFrameInstance(transfer);
      synchronization = transformIFrameInstance(synchronization);

      const { source } = synchronization;

      switch (source) {
        case SynchronizationSource.SQL: {
          return await this.sqlSynchronizationService.reload(
            synchronization,
            transfer
          );
        }
        case SynchronizationSource.API: {
          return await this.apiSynchronizationService.reload(
            req,
            synchronization,
            transfer
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while reloading import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(req: Request, id: string) {
    const responseHandler = new ResponseHandler();
    try {
      //   const process = await this.importProcessesRepository.findById(id);
      //   if (!process) {
      //     responseHandler.setError(404, 'Import process not found');
      //     return responseHandler;
      //   }

      //   if (process.status !== ImportStatus.FAILED) {
      //     responseHandler.setError(
      //       409,
      //       'Only failed import process can be retried'
      //     );
      //     return responseHandler;
      //   }

      //   const impt = await this.importsRepository.findById(
      //     process.import.toString()
      //   );
      //   if (!impt) {
      //     responseHandler.setError(404, 'Import not found');
      //     return responseHandler;
      //   }
      let transfer = await new iFrameTransfer(
        dbClient,
        { status: TransferStatus.PENDING },
        id
      ).save();
      let synchronization = await transfer.getSynchronization();

      transfer = transformIFrameInstance(transfer);
      synchronization = transformIFrameInstance(synchronization);

      const { source } = synchronization;

      switch (source) {
        case SynchronizationSource.SQL: {
          return await this.sqlSynchronizationService.retry(
            synchronization,
            transfer
          );
        }
        case SynchronizationSource.API: {
          return await this.apiSynchronizationService.retry(
            req,
            synchronization,
            transfer
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while reloading import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default TransfersService;
