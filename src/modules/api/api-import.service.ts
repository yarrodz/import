import { Request } from 'express';

import ProcessesRepository from '../processes/process.repository';
import TransfersRepository from '../transfers/transfers.repository';
import ApiConnectionHelper from './helpers/api-connection.helper';
import ApiColumnsHelper from './helpers/api-columns.helper';
import ApiImportHelper from './helpers/api-import.helper';
import OAuth2AuthUriHelper from '../oauth2/helpers/oauth2-auth-uri.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import ApiImport from './interfaces/api-import.interface';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import { ConnectionState } from './enums/connection-state.enum';
import Context from '../imports/interfaces/context.interface';
import { ContextAction } from '../imports/enums/context-action-enum';
import ApiConnection from './interfaces/api-connection.interface';
import { CreateApiImportValidator } from './validators/create-api-import.validator';
import { UpdateApiImportValidator } from './validators/update-api-import.validator';

class ApiImportService {
  private apiConnectionHelper: ApiConnectionHelper;
  private apiColumnsHelper: ApiColumnsHelper;
  private apiImportHelper: ApiImportHelper;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;
  private processesRepository: ProcessesRepository;
  private transfersRepository: TransfersRepository;

  constructor(
    apiConnectionHelper: ApiConnectionHelper,
    apiColumnsHelper: ApiColumnsHelper,
    apiImportHelper: ApiImportHelper,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper,
    processesRepository: ProcessesRepository,
    transfersRepository: TransfersRepository
  ) {
    this.apiConnectionHelper = apiConnectionHelper;
    this.apiColumnsHelper = apiColumnsHelper;
    this.apiImportHelper = apiImportHelper;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
    this.processesRepository = processesRepository;
    this.transfersRepository = transfersRepository;
  }

  async create(input: any, getColumns: boolean) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateApiImportValidator.validate(input);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const impt = await this.processesRepository.create(input);

      if (getColumns === false) {
        responseHandler.setSuccess(200, {
          import: impt
        });
        return responseHandler;
      } else {
        const columns = await this.apiColumnsHelper.find(impt);
        responseHandler.setSuccess(200, {
          import: impt,
          columns
        });
      }
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(req: Request, input: any, getColumns: boolean, start: boolean) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = UpdateApiImportValidator.validate(input);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const { id } = input;

      const impt = await this.processesRepository.load(id);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.update(input);

      if (getColumns === true) {
        const columns = await this.apiColumnsHelper.find(impt);
        responseHandler.setSuccess(200, {
          import: updatedImport,
          columns
        });
        return responseHandler; 
      }
      
      else if (start === true) {
        return this.import(req, updatedImport);
      }
      
      else {
        responseHandler.setSuccess(200, {
          import: updatedImport
        });
        return responseHandler;
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }


  async getColumns(req: Request, impt: ApiImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection as ApiConnection;
      const { id: connectionId } = connection;

      const context: Context = {
        action: ContextAction.GET_COLUMNS,
        connectionId,
        importId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          connection,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.load(importId);

      const columns = await this.apiColumnsHelper.find(updatedImport);

      responseHandler.setSuccess(200, columns);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async checkIdColumnUniqueness(
    req: Request,
    impt: ApiImport
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection as ApiConnection;
      const { id: connectionId } = connection;

      const context: Context = {
        action: ContextAction.GET_COLUMNS,
        connectionId,
        importId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          connection,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.load(importId);

      const idColumnUnique =
        await this.apiColumnsHelper.checkIdColumnUniqueness(updatedImport);

      responseHandler.setSuccess(200, idColumnUnique);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(req: Request, impt: ApiImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const { transferMethod } = impt;
      const connection = impt.__.hasConnection as ApiConnection;
      const { id: connectionId } = connection;
      const unit = impt.__.inUnit;
      const { id: unitId } = unit;

      const context: Context = {
        action: ContextAction.IMPORT,
        connectionId,
        importId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          connection,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.load(importId);

      const transfer = await this.transfersRepository.create({
        type: TransferType.IMPORT,
        method: transferMethod,
        status: TransferStatus.PENDING,
        offset: 0,
        transferedDatasetsCount: 0,
        log: [],
        retryAttempts: 0,
        __: {
          inImport: {
            id: importId,
            _d: 'out'
          },
          inUnit: {
            id: unitId,
            _d: 'out'
          }
        }
      });

      this.apiImportHelper.import({
        import: updatedImport,
        transfer
      });

      const { id: transferId } = transfer;
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ApiImportService;
