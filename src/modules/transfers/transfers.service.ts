import { Request } from 'express';

import SqlTransferService from '../sql/sql-transfer.service';
import ApiTransferService from '../api/api-transfer.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { TransferStatus } from './enums/transfer-status.enum';
import TransfersRepository from './transfers.repository';
import ProcessesRepository from '../processes/process.repository';
import { Source } from '../imports/enums/source.enum';

class TransfersService {
  private transfersRepository: TransfersRepository;
  private processesRepository: ProcessesRepository;
  private sqlTransferService: SqlTransferService;
  private apiTransferService: ApiTransferService;

  constructor(
    sqlTransferService: SqlTransferService,
    apiTransferService: ApiTransferService
  ) {
    this.transfersRepository = new TransfersRepository();
    this.processesRepository = new ProcessesRepository();
    this.sqlTransferService = sqlTransferService;
    this.apiTransferService = apiTransferService;
  }

  // async getAll(
  //   unitId: number,
  //   synchronizationId: number
  // ): Promise<ResponseHandler> {
  //   const responseHandler = new ResponseHandler();
  //   try {
  //     const transfers = await this.transfersRepository.getAll({
  //       unitId,
  //       synchronizationId
  //     });
  //     responseHandler.setSuccess(200, transfers);
  //     return responseHandler;
  //   } catch (error) {
  //     responseHandler.setError(500, error.message);
  //     return responseHandler;
  //   }
  // }

  async delete(id: number) {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.transfersRepository.get(id);
      if (!transfer) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      if (transfer.status === TransferStatus.PENDING) {
        responseHandler.setError(
          409,
          'Pending import process cannot be deleted'
        );
        return responseHandler;
      }

      await this.transfersRepository.delete(id);
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
      const transfer = await this.transfersRepository.get(id);
      if (!transfer) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      if (transfer.status !== TransferStatus.PENDING) {
        responseHandler.setError(
          409,
          'Only pending transfer process can be paused'
        );
        return responseHandler;
      }

      await this.transfersRepository.update({
        id,
        status: TransferStatus.PAUSED
      });
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(req: Request, id: number) {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.transfersRepository.get(id);
      if (!transfer) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      const importId = transfer.__.inImport.id;

      if (transfer.status !== TransferStatus.PAUSED) {
        responseHandler.setError(409, 'Only paused transfer can be reloaded');
        return responseHandler;
      }

      const impt = await this.processesRepository.get(importId);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      // const pendingImport =
      //   await this.importProcessesRepository.findPendingByUnit(
      //     impt.unit as string
      //   );
      // if (pendingImport) {
      //   responseHandler.setError(
      //     409,
      //     'This unit is currently processing another import'
      //   );
      //   return responseHandler;
      // }

      const updatedTransfer = await this.transfersRepository.update({
        id,
        status: TransferStatus.PENDING
      });

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlTransferService.reload(impt, updatedTransfer);
        }
        case Source.API: {
          return await this.apiTransferService.reload(
            req,
            impt,
            updatedTransfer
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while reloading import. Unknown synchronization source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(req: Request, id: number) {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.transfersRepository.get(id);
      if (!transfer) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      const importId = transfer.__.inImport.id;

      if (transfer.status !== TransferStatus.FAILED) {
        responseHandler.setError(409, 'Only failed transfer can be retried');
        return responseHandler;
      }

      const impt = await this.processesRepository.get(importId);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const updatedTransfer = await this.transfersRepository.update({
        transfer: {
          id,
          status: TransferStatus.PENDING
        }
      });

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlTransferService.retry(impt, updatedTransfer);
        }
        case Source.API: {
          return await this.apiTransferService.retry(
            req,
            impt,
            updatedTransfer
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while retrieng transfer. Unknown synchronization source '${source}'.`
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
