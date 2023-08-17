import ProcessesRepository from '../../processes/process.repository';
import OAuth2RefreshTokenHelper from '../../oauth2/helpers/oath2-refresh-token.helper';
import ApiImport from '../interfaces/api-import.interface';
import ApiConnector from '../connector/api-connector';
import { ConnectionState } from '../enums/connection-state.enum';
import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';
import ApiConnection from '../interfaces/api-connection.interface';

class ApiConnectionHelper {
  private oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper;
  private processesRepository: ProcessesRepository;

  constructor(
    oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper,
    processesRepository: ProcessesRepository
  ) {
    this.oAuth2RefreshTokenHelper = oAuth2RefreshTokenHelper;
    this.processesRepository = processesRepository;
  }

  public async connect(impt: ApiImport): Promise<ConnectionState> {
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection as ApiConnection;

      if (connection.type === ApiConnectionType.OAUTH2) {
        const { oauth2 } = connection;
        if (oauth2.access_token === undefined) {
          // If access token not exists - we have to receive it
          return ConnectionState.OAUTH2_REQUIRED;
        } else {
          try {
            // If exists - send request
            await this.sendRequest(impt);
            return ConnectionState.CONNECTED;
          } catch (error) {
            if (oauth2.refresh_token === undefined) {
              // If api oauth2 does not have refresh tokens - access token never expire(Notion api);
              // Api import settings that request is generated from not valid
              throw error;
            } else {
              // Try to refresh access token
              try {
                await this.oAuth2RefreshTokenHelper.refresh(connection);
              } catch (error) {
                // The error while refreshing access token.
                // That means that refresh token was expired.
                return ConnectionState.OAUTH2_REQUIRED;
              }
              // Send request with refreshed access token.
              // If request fails - Api import settings not valid
              const updatedImport = await this.processesRepository.get(
                importId
              );
              await this.sendRequest(updatedImport);
              return ConnectionState.CONNECTED;
            }
          }
        }
      } else {
        await this.sendRequest(impt);
        return ConnectionState.CONNECTED;
      }
    } catch (error) {
      throw new Error(`Error while connecting to API: ${error.message}`);
    }
  }

  private async sendRequest(impt: ApiImport) {
    const { transferMethod } = impt;

    const apiConnector = new ApiConnector(impt);
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
        throw new Error(`Unknown API transfer method: '${transferMethod}'.`);
      }
    }
  }
}

export default ApiConnectionHelper;
