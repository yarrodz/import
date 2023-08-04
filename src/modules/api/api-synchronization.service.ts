import { Request } from 'express';
import { iFrameTransfer, iFrameSynchronization } from 'iframe-ai';

import ApiColumnsHelper from './helpers/api-columns.helper';
import ApiTransferHelper from './helpers/api-transfer.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import Synchronization from '../synchronizations/interfaces/synchronization.interface';
import Transfer from '../transfers/interfaces/transfer.interface';
import dbClient from '../../utils/db-client/db-client';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferMethod } from '../transfers/enums/transfer-method.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import ApiImport from './interfaces/api-import.interface';
import SynchronizationContext from '../synchronizations/interfaces/synchronization-context.interface';
import { SynchronizationContextAction } from '../synchronizations/enums/synchronization-context-action.enum';
import ApiConnectionHelper from './helpers/api-connection.helper';
import OAuth2AuthUriHelper from '../oauth2/helpers/oauth2-auth-uri.helper';
import { ConnectionState } from '../connection/connection-state.enum';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

class ApiSynchronizationService {
  private apiConnectionHelper: ApiConnectionHelper;
  private apiColumnsHelper: ApiColumnsHelper;
  private apiTransferHelper: ApiTransferHelper;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;

  constructor(
    apiConnectionHelper: ApiConnectionHelper,
    apiColumnsHelper: ApiColumnsHelper,
    apiTransferHelper: ApiTransferHelper,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper
  ) {
    this.apiConnectionHelper = apiConnectionHelper;
    this.apiColumnsHelper = apiColumnsHelper;
    this.apiTransferHelper = apiTransferHelper;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
  }

  async getColumns(
    req: Request,
    synchronization: Synchronization
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: synchronizationId } = synchronization;

      const context: SynchronizationContext = {
        action: SynchronizationContextAction.CONNECT,
        synchronizationId
      };
      const connectionState = await this.apiConnectionHelper.connect(
        synchronization
      );
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          synchronization,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      // const updatedImport = await this.importsRepository.findById(importId);

      // const idColumnUnique =
      //   await this.apiColumnsHelper.checkIdColumnUniqueness(updatedImport);
      // if (!idColumnUnique) {
      //   responseHandler.setError(
      //     409,
      //     'Provided id column includes duplicate values'
      //   );
      //   return responseHandler;
      // }

      const columns = await this.apiColumnsHelper.find(synchronization);

      responseHandler.setSuccess(200, {
        synchronizationId,
        columns
      });
      return responseHandler;
    } catch (error) {
      // console.log('AS:',  error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(
    req: Request,
    synchronization: Synchronization
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: synchronizationId } = synchronization;

      const context: SynchronizationContext = {
        action: SynchronizationContextAction.IMPORT,
        synchronizationId
      };
      const connectionState = await this.apiConnectionHelper.connect(
        synchronization
      );
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          synchronization,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      let {
        synchronization: updatedSynchronization,
        unit,
        connection,
        import: impt,
        export: expt
      } = await new iFrameSynchronization(dbClient).getOneById(
        synchronizationId
      );
      updatedSynchronization = {
        ...transformIFrameInstance(updatedSynchronization),
        unit: transformIFrameInstance(unit),
        connection: transformIFrameInstance(connection),
        import: transformIFrameInstance(impt),
        export: transformIFrameInstance(expt)
      };
      const { id: unitId } = unit;
      impt = synchronization.import as ApiImport;
      const { transferMethod } = impt;

      let transfer = await new iFrameTransfer(dbClient).insertOne(
        {
          type: TransferType.IMPORT,
          method: transferMethod,
          status: TransferStatus.PENDING,
          totalDatasetsCount: 0,
          processedDatasetsCount: 0,
          transferedDatasetsCount: 0,
          log: [],
          retryAttempts: 0,
          errorMessage: null
        },
        unitId,
        synchronizationId
      );
      transfer = transformIFrameInstance(transfer);

      const { id: transferId } = transfer;

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.apiTransferHelper.import(updatedSynchronization, transfer);
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      console.log('Api Error: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(
    req: Request,
    synchronization: Synchronization,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: synchronizationId } = synchronization;
      const { id: transferId } = transfer;

      const context: SynchronizationContext = {
        action: SynchronizationContextAction.RELOAD,
        synchronizationId,
        transferId
      };
      const connectionState = await this.apiConnectionHelper.connect(
        synchronization
      );
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          synchronization,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      let updatedSynchronization = await new iFrameSynchronization(
        dbClient
      ).getOneById(synchronizationId);
      updatedSynchronization = transformIFrameInstance(updatedSynchronization);

      let reloadedTransfer = await new iFrameTransfer(dbClient, {
        status: TransferStatus.PENDING
      }).save();
      reloadedTransfer = transformIFrameInstance(reloadedTransfer);

      this.apiTransferHelper.import(updatedSynchronization, reloadedTransfer);
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(
    req: Request,
    synchronization: Synchronization,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: synchronizationId } = synchronization;
      const { id: transferId } = transfer;

      const context: SynchronizationContext = {
        action: SynchronizationContextAction.RETRY,
        synchronizationId,
        transferId
      };
      const connectionState = await this.apiConnectionHelper.connect(
        synchronization
      );
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          synchronization,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      let updatedSynchronization = await new iFrameSynchronization(
        dbClient
      ).getOneById(synchronizationId);
      updatedSynchronization = transformIFrameInstance(updatedSynchronization);

      let retriedTransfer = await new iFrameTransfer(dbClient, {
        attempts: 0,
        status: TransferStatus.PENDING,
        errorMessage: null
      }).save();
      retriedTransfer = transformIFrameInstance(retriedTransfer);

      this.apiTransferHelper.import(updatedSynchronization, retriedTransfer);
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ApiSynchronizationService;
