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

class ApiImportService {
  private processesRepository: ProcessesRepository;
  private transfersRepository: TransfersRepository;
  private apiConnectionHelper: ApiConnectionHelper;
  private apiColumnsHelper: ApiColumnsHelper;
  private apiImportHelper: ApiImportHelper;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;

  constructor(
    apiImportHelper: ApiImportHelper,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper
  ) {
    this.processesRepository = new ProcessesRepository();
    this.transfersRepository = new TransfersRepository();
    this.apiConnectionHelper = new ApiConnectionHelper();
    this.apiColumnsHelper = new ApiColumnsHelper();
    this.apiImportHelper = apiImportHelper;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
  }

  async getColumns(req: Request, impt: ApiImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection[0];
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

      const updatedImport = await this.processesRepository.get(importId);

      const columns = await this.apiColumnsHelper.find(updatedImport);

      responseHandler.setSuccess(200, columns);
      return responseHandler;
    } catch (error) {
      console.error('sError: ', error)
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
      const connection = impt.__.hasConnection[0];
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

      const updatedImport = await this.processesRepository.get(importId);

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
      const { id: importId, unit } = impt;
      const { transferMethod } = impt;
      const connection = impt.__.hasConnection[0];
      const { id: connectionId } = connection;
      // const { id: unitId } = unit;

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

      const updatedImport = await this.processesRepository.get(importId);

      const transfer = await this.transfersRepository.create({
        type: TransferType.IMPORT,
        method: transferMethod,
        status: TransferStatus.PENDING,
        transferedDatasetsCount: 0,
        log: [],
        retryAttempts: 0,
        // __: {
          // unitId,
          // importId
        // }
      });

      const { id: transferId } = transfer;

      this.apiImportHelper.import({
        import: updatedImport,
        transfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      console.error('aError: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ApiImportService;
