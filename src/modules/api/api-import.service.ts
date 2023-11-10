import { Request } from 'express';

import { ProcessesRepository } from '../processes/process.repository';
import { ApiConnectionHelper } from './helpers/api-connection.helper';
import { ApiColumnsHelper } from './helpers/api-columns.helper';
import { ApiImportHelper } from './helpers/api-import.helper';
import { OAuth2AuthUriHelper } from '../oauth2/helpers/oauth2-auth-uri.helper';
import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { ApiImport } from './interfaces/api-iframe-transfer.interface';
import { TransferType } from '../transfer-processes/enums/transfer-type.enum';
// import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import { Connectionstatus } from './enums/connection-status.enum';
import { Context } from '../oauth2/interfaces/context.interface';
import { ContextAction } from '../oauth2/enums/context-action-enum';
import { ApiConnection } from './interfaces/api-connection.interface';
import { CreateApiImportValidator } from './validators/create-api-import.validator';
import { UpdateApiImportValidator } from './validators/update-api-import.validator';
import { ApiTransferHelper } from './helpers/api-transfer-helper';

export class ApiImportService {
  private apiConnectionHelper: ApiConnectionHelper;
  private apiColumnsHelper: ApiColumnsHelper;
  private apiImportHelper: ApiImportHelper;
  private apiTransferHelper: ApiTransferHelper;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;
  private processesRepository: ProcessesRepository;

  constructor(
    apiConnectionHelper: ApiConnectionHelper,
    apiColumnsHelper: ApiColumnsHelper,
    apiImportHelper: ApiImportHelper,
    apiTransferHelper: ApiTransferHelper,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper,
    processesRepository: ProcessesRepository
  ) {
    this.apiConnectionHelper = apiConnectionHelper;
    this.apiColumnsHelper = apiColumnsHelper;
    this.apiImportHelper = apiImportHelper;
    this.apiTransferHelper = apiTransferHelper;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
    this.processesRepository = processesRepository;
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
      } else if (start === true) {
        return this.startImport(req, updatedImport);
      } else {
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
      const connectionstatus = await this.apiConnectionHelper.connect(impt);
      if (connectionstatus === Connectionstatus.OAUTH2_REQUIRED) {
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
      const connectionstatus = await this.apiConnectionHelper.connect(impt);
      if (connectionstatus === Connectionstatus.OAUTH2_REQUIRED) {
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

  async startImport(req: Request, impt: ApiImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection as ApiConnection;
      const { id: connectionId } = connection;

      const context: Context = {
        action: ContextAction.IMPORT,
        connectionId,
        importId
      };
      const connectionstatus = await this.apiConnectionHelper.connect(impt);
      if (connectionstatus === Connectionstatus.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          connection,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.load(importId);

      const transfer = await this.apiTransferHelper.createStartedTransfer(impt);

      const { id: transferId } = transfer;

      this.apiImportHelper.import({
        import: updatedImport,
        transfer
      });

      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}
