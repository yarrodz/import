import { Request } from 'express';

import ProcessesRepository from '../processes/process.repository';
import TransfersRepository from '../transfers/transfers.repository';
import ApiConnectionHelper from './helpers/api-connection.helper';
import ApiImportHelper from './helpers/api-import.helper';
import OAuth2AuthUriHelper from '../oauth2/helpers/oauth2-auth-uri.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import ApiImport from './interfaces/api-import.interface';
import Transfer from '../transfers/interfaces/transfer.interface';
import { ConnectionState } from './enums/connection-state.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import Context from '../imports/interfaces/context.interface';
import { ContextAction } from '../imports/enums/context-action-enum';

class ApiTransferService {
  private processesRepository: ProcessesRepository;
  private transfersRepository: TransfersRepository;
  private apiConnectionHelper: ApiConnectionHelper;
  private apiImportHelper: ApiImportHelper;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;

  constructor(
    apiImportHelper: ApiImportHelper,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper
  ) {
    this.processesRepository = new ProcessesRepository();
    this.transfersRepository = new TransfersRepository();
    this.apiConnectionHelper = new ApiConnectionHelper();
    this.apiImportHelper = apiImportHelper;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
  }

  async reload(
    req: Request,
    impt: ApiImport,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection[0];
      const { id: connectionId } = connection;
      const { id: transferId } = transfer;

      const context: Context = {
        action: ContextAction.RELOAD,
        connectionId,
        importId,
        transferId
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

      const reloadedTransfer = await this.transfersRepository.update({
        id: transferId,
        status: TransferStatus.PENDING
      });

      this.apiImportHelper.import({
        import: updatedImport,
        transfer: reloadedTransfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(
    req: Request,
    impt: ApiImport,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection[0];
      const { id: connectionId } = connection;
      const { id: transferId } = transfer;

      const context: Context = {
        action: ContextAction.RETRY,
        connectionId,
        importId,
        transferId
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

      const retriedTransfer = await this.transfersRepository.update({
        id: transferId,
        retryAttempts: 0,
        status: TransferStatus.PENDING
      });

      this.apiImportHelper.import({
        import: updatedImport,
        transfer: retriedTransfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ApiTransferService;
