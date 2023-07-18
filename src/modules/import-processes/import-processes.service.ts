import { Request } from 'express';

import ImportProcessesRepository from './import-processes.repository';
import ImportsRepository from '../imports/imports.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { ImportStatus } from './enums/import-status.enum';
import ConnectionService from '../connection/connection.service';
import TransferService from '../transfer/transfer.service';
import IImportContext from '../imports/interfaces/import-context.interface';
import { ImportContextAction } from '../imports/enums/import-context-action.enum';
import { ConnectionState } from '../connection/enums/connection-state.enum';
import OAuth2AuthUriHelper from '../oauth2/oauth2-auth-uri.helper';

class ImportProcessesService {
  private importProcessesRepository: ImportProcessesRepository;
  private importsRepository: ImportsRepository;
  private connectionService: ConnectionService;
  private transferService: TransferService;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    importsRepository: ImportsRepository,
    connectionService: ConnectionService,
    transferService: TransferService,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.importsRepository = importsRepository;
    this.connectionService = connectionService;
    this.transferService = transferService;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
  }

  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const processes = await this.importProcessesRepository.findAll(unit);
      responseHandler.setSuccess(200, processes);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status === ImportStatus.PENDING) {
        responseHandler.setError(
          409,
          'Pending import process cannot be deleted'
        );
        return responseHandler;
      }

      await this.importProcessesRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async pause(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status !== ImportStatus.PENDING) {
        responseHandler.setError(
          409,
          'Only pending import process can be paused'
        );
        return responseHandler;
      }

      await this.importProcessesRepository.update(id, {
        status: ImportStatus.PAUSED
      });

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
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status !== ImportStatus.PAUSED) {
        responseHandler.setError(
          409,
          'Only paused import process can be reloaded'
        );
        return responseHandler;
      }

      const impt = await this.importsRepository.findById(
        process.import.toString()
      );
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      const { _id: importId } = impt;

      const pendingImport =
        await this.importProcessesRepository.findPendingByUnit(
          impt.unit as string
        );
      if (pendingImport) {
        responseHandler.setError(
          409,
          'This unit is currently processing another import'
        );
        return responseHandler;
      }

      const context: IImportContext = {
        action: ImportContextAction.RELOAD,
        importId,
        processId: id
      };
      const connectionState = await this.connectionService.connect(importId);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }

      await this.importProcessesRepository.update(id, {
        status: ImportStatus.PENDING
      });

      this.transferService.transfer(importId, id);
      responseHandler.setSuccess(200, id);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(req: Request, id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status !== ImportStatus.FAILED) {
        responseHandler.setError(
          409,
          'Only failed import process can be retried'
        );
        return responseHandler;
      }

      const impt = await this.importsRepository.findById(
        process.import.toString()
      );
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      const { _id: importId } = impt;

      const context: IImportContext = {
        action: ImportContextAction.RETRY,
        importId,
        processId: id
      };
      const connectionState = await this.connectionService.connect(importId);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }

      await this.importProcessesRepository.update(id, {
        attempts: 0,
        status: ImportStatus.PENDING,
        errorMessage: null
      });

      this.transferService.transfer(importId, id);
      responseHandler.setSuccess(200, id);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ImportProcessesService;
