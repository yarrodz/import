import { Request } from 'express';

import SqlTransferService from '../sql/sql-transfer.service';
import ApiTransferService from '../api/api-transfer.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { TransferStatus } from './enums/transfer-status.enum';
import TransfersRepository from './transfers.repository';
import ProcessesRepository from '../processes/process.repository';
import { Source } from '../imports/enums/source.enum';
import EmailTransferService from '../email/email-transfer.service';

class TransfersService {
  private sqlTransferService: SqlTransferService;
  private apiTransferService: ApiTransferService;
  private emailTransferService: EmailTransferService;
  private transfersRepository: TransfersRepository;
  private processesRepository: ProcessesRepository;

  constructor(
    sqlTransferService: SqlTransferService,
    apiTransferService: ApiTransferService,
    emailTransferService: EmailTransferService,
    transfersRepository: TransfersRepository,
    processesRepository: ProcessesRepository
  ) {
    this.sqlTransferService = sqlTransferService;
    this.apiTransferService = apiTransferService;
    this.emailTransferService = emailTransferService;
    this.transfersRepository = transfersRepository;
    this.processesRepository = processesRepository;
  }

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const transfers = await this.transfersRepository.query(
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
      // const transfer = await this.transfersRepository.load(id);
      // if (transfer === undefined) {
      //   responseHandler.setError(404, 'Transfer not found');
      //   return responseHandler;
      // }

      // if (transfer.status === TransferStatus.PENDING) {
      //   responseHandler.setError(
      //     409,
      //     'Pending import process cannot be deleted'
      //   );
      //   return responseHandler;
      // }

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
      const transfer = await this.transfersRepository.load(id);
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
      const transfer = await this.transfersRepository.load(id);
      if (transfer === undefined) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      if (transfer.status !== TransferStatus.PAUSED) {
        responseHandler.setError(409, 'Only paused transfer can be reloaded');
        return responseHandler;
      }

      const { id: importId } = transfer.__.inImport;
      const impt = await this.processesRepository.load(importId);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { id: unitId } = transfer.__.inUnit;

      // const pendingUnitTransfer = await this.transfersRepository.query(
      //   {
      //     operator: 'and',
      //     conditions: [
      //       {
      //         type: 'equals',
      //         property: 'status',
      //         value: TransferStatus.PENDING
      //       },
      //       {
      //         type: 'inEdge',
      //         label: 'inUnit',
      //         value: unitId
      //       }
      //     ]
      //   },
      //   {},
      //   true
      // );
      // if (pendingUnitTransfer) {
      //   responseHandler.setError(
      //     409,
      //     'This unit is already processing another transfer.'
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

  async retry(req: Request, id: number) {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.transfersRepository.load(id);
      if (transfer === undefined) {
        responseHandler.setError(404, 'Transfer not found');
        return responseHandler;
      }

      if (transfer.status !== TransferStatus.FAILED) {
        responseHandler.setError(409, 'Only failed transfer can be retried');
        return responseHandler;
      }

      const { id: importId } = transfer.__.inImport;
      const impt = await this.processesRepository.load(importId);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { id: unitId } = transfer.__.inUnit;

      const pendingUnitTransfer = await this.transfersRepository.query(
        {
          operator: 'and',
          conditions: [
            {
              type: 'equals',
              property: 'status',
              value: TransferStatus.PENDING
            },
            {
              type: 'inEdge',
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

      const updatedTransfer = await this.transfersRepository.update({
        id,
        status: TransferStatus.PENDING
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
        case Source.EMAIL: {
          return await this.emailTransferService.retry(impt, updatedTransfer);
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

export default TransfersService;
