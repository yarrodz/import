import { iFrameSynchronization } from 'iframe-ai';

import { ConnectionState } from '../../connection/connection-state.enum';
import OAuth2RefreshTokenHelper from '../../oauth2/helpers/oath2-refresh-token.helper';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import { ApiConnectionType } from '../enums/api-connection-type.enum';
import ApiConnection from '../interfaces/api-connection.interface';
import ApiImport from '../interfaces/api-import.interface';
import dbClient from '../../../utils/db-client/db-client';
import ApiConnector from '../connector/api-connector';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class ApiConnectionHelper {
  private oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper;

  constructor(oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper) {
    this.oAuth2RefreshTokenHelper = oAuth2RefreshTokenHelper;
  }

  public async connect(
    synchronization: Synchronization
  ): Promise<ConnectionState> {
    try {
      const { id: synchronizationId } = synchronization;
      const connection = synchronization.connection as ApiConnection;
      const impt = synchronization.import as ApiImport;

      if (connection.type === ApiConnectionType.OAUTH2) {
        const { oauth2 } = connection;
        if (!oauth2.access_token) {
          return ConnectionState.OAUTH2_REQUIRED;
        } else {
          try {
            await this.sendRequest(synchronization);
            return ConnectionState.CONNECTED;
          } catch (error) {
            try {
              await this.oAuth2RefreshTokenHelper.refresh(synchronization);
            } catch (error) {
              return ConnectionState.OAUTH2_REQUIRED;
            }
            let refreshedSynchronization = await new iFrameSynchronization(
              dbClient
            ).getOneById(synchronizationId);
            refreshedSynchronization = transformIFrameInstance(
              refreshedSynchronization
            );
            await this.sendRequest(refreshedSynchronization);
          }
        }
      } else {
        await this.sendRequest(synchronization);
      }
      return ConnectionState.CONNECTED;
    } catch (error) {
      throw new Error(`Error while connecting to API: ${error.message}`);
    }
  }

  private async sendRequest(synchronization: Synchronization) {
    const connection = synchronization.connection as ApiConnection;
    const impt = synchronization.import as ApiImport;
    const { transferMethod } = impt;

    const apiConnector = new ApiConnector(impt, connection);
    await apiConnector.authRequest();
    switch (transferMethod) {
      case TransferMethod.CHUNK: {
        await apiConnector.sendRequest();
        break;
      }
      case TransferMethod.OFFSET_PAGINATION: {
        const pagination: OffsetPagination = {
          offset: 0,
          limit: 1
        };
        apiConnector.paginateRequest(pagination);
        await apiConnector.sendRequest();
        break;
      }
      case TransferMethod.CURSOR_PAGINATION: {
        const pagination: CursorPagination = {
          limit: 1
        };
        apiConnector.paginateRequest(pagination);
        await apiConnector.sendRequest();
        break;
      }
      default: {
        throw new Error(`Unknown API transfer type: '${transferMethod}'.`);
      }
    }
  }
}

export default ApiConnectionHelper;
