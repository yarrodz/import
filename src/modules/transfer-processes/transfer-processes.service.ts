import { Request } from 'express';
import { Server as IO } from 'socket.io';

import { SqlTransferService } from '../sql/services/sql-transfer-processes.service';
import { ApiTransferService } from '../api/api-transfer old.service';
import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { TransferStatus } from './enums/transfer-status.enum';
import { TransferProcessesRepository } from './transfer-processes.repository';
import { TransfersRepository } from '../transfers/transfers.repository';
// import { Source } from '../oauth2/enums/source.enum';
import { EmailTransferService } from '../email/services/email-transfer.service';

export class TransfersService {
  constructor(
    private io: IO,
    private sqlTransferService: SqlTransferService,
    private apiTransferService: ApiTransferService,
    private emailTransferService: EmailTransferService,
    private transferProcessesRepository: TransferProcessesRepository,
    private transfersRepository: TransfersRepository,
  ) {}

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const transfers = await this.transferProcessesRepository.query(
        select,
        sortings,
        false
      );
      responseHandler.setSuccess(200, transfers);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: number) {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.transferProcessesRepository.load(id);
      if (transfer === undefined) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      if (
        transfer.status === TransferStatus.PENDING ||
        transfer.status === TransferStatus.PAUSING
      ) {
        responseHandler.setError(
          409,
          'Pending import process cannot be deleted'
        );
        return responseHandler;
      }

      await this.transferProcessesRepository.delete(id);
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
      const transfer = await this.transferProcessesRepository.load(id);
      const { id: unitId } = transfer.__.inUnit;
      if (transfer === undefined) {
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

      const pausingTransfer =
        await this.transferProcessesRepository.update({
          id,
          status: TransferStatus.PAUSING,
          log: 'Transfer was pused'
        });

      // this.io.to(unitId.toString().emit('transfer', pausingTransfer);
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
      const transfer = await this.transferProcessesRepository.load(id);
      if (transfer === undefined) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      if (
        transfer.status !== TransferStatus.PAUSED &&
        transfer.status !== TransferStatus.FAILED
      ) {
        responseHandler.setError(
          409,
          'Only paused or failed transfer can be reloaded'
        );
        return responseHandler;
      }

      const { id: importId } = transfer.__.inImport;
      const impt = await this.transfersRepository.load(importId);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { id: unitId } = transfer.__.inUnit;

      const pendingUnitTransfer = await this.transferProcessesRepository.query(
        {
          operator: 'and',
          conditions: [
            {
              type: 'equals',
              property: 'status',
              value: TransferStatus.PENDING
            },
            {
              type: 'hasEdge',
              direction: 'in',
              label: 'inUnit',
              value: unitId
            }
          ]
        },
        {},
        true
      );

      // console.log('pendingUnitTransfer: ', pendingUnitTransfer);
      if (pendingUnitTransfer) {
        responseHandler.setError(
          409,
          'This unit is already processing another transfer.'
        );
        return responseHandler;
      }

      const updatedTransfer = await this.transferProcessesRepository.update({
        id,
        status: TransferStatus.PENDING,
        retryAttempts: 0,
        log: 'Transfer was reloaded'
      });

      this.io.to(String(unitId)).emit('transfer', updatedTransfer);

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
        case Source.EMAIL: {
          return await this.emailTransferService.reload(impt, updatedTransfer);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while reloading import. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async restart(req: Request, id: number) {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.transferProcessesRepository.load(id);
      if (transfer === undefined) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      // if (
      //   transfer.status !== TransferStatus.PAUSED &&
      //   transfer.status !== TransferStatus.FAILED
      // ) {
      //   responseHandler.setError(
      //     409,
      //     'Only paused or failed transfer can be restarted'
      //   );
      //   return responseHandler;
      // }

      const { id: importId } = transfer.__.inImport;
      const impt = await this.transfersRepository.load(importId);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { id: unitId } = transfer.__.inUnit;

      const pendingUnitTransfer = await this.transferProcessesRepository.query(
        {
          operator: 'and',
          conditions: [
            {
              type: 'equals',
              property: 'status',
              value: TransferStatus.PENDING
            },
            {
              type: 'hasEdge',
              direction: 'in',
              label: 'inUnit',
              value: unitId
            }
          ]
        },
        {},
        true
      );
      if (pendingUnitTransfer) {
        responseHandler.setError(
          409,
          'This unit is already processing another transfer.'
        );
        return responseHandler;
      }

      let updatedTransfer = await this.transferProcessesRepository.update({
        id,
        status: TransferStatus.PENDING,
        references: undefined,
        offset: 0,
        transferedDatasetsCount: 0,
        log: 'Transfer was restarted',
        retryAttempts: 0
      });

      this.io.to(String(unitId)).emit('transfer', updatedTransfer);

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlTransferService.restart(impt, updatedTransfer);
        }
        //fix later
        case Source.API: {
          return await this.apiTransferService.retry(
            req,
            impt,
            updatedTransfer
          );
        }
        case Source.EMAIL: {
          return await this.emailTransferService.restart(impt, updatedTransfer);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while retrieng transfer. Unknown source '${source}'.`
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
