import ProcessesRepository from '../../processes/process.repository';
import OAuth2RefreshTokenHelper from '../../oauth2/helpers/oath2-refresh-token.helper';
import ApiImport from '../interfaces/api-import.interface';
import ApiConnector from '../connector/api-connector';
import { ConnectionState } from '../enums/connection-state.enum';
import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';

class ApiConnectionHelper {
  private processesRepository: ProcessesRepository;
  private oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper;

  constructor() {
    this.processesRepository = new ProcessesRepository();
    this.oAuth2RefreshTokenHelper = new OAuth2RefreshTokenHelper();
  }

  public async connect(impt: ApiImport): Promise<ConnectionState> {
    try {
      const { id: importId } = impt;
      const connection = impt.__.hasConnection[0];


      if (connection.type === ApiConnectionType.OAUTH2) {
        const { oauth2 } = connection;
        if (oauth2.access_token === undefined) {
          return ConnectionState.OAUTH2_REQUIRED;
        } else {
          try {
            await this.sendRequest(impt);
            return ConnectionState.CONNECTED;
          } catch (error) {
            try {
              await this.oAuth2RefreshTokenHelper.refresh(connection);
            } catch (error) {
              return ConnectionState.OAUTH2_REQUIRED;
            }
            const updatedImport = await this.processesRepository.get(importId);
            await this.sendRequest(updatedImport);
            return ConnectionState.CONNECTED;
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
        throw new Error(`Unknown API transfer type: '${transferMethod}'.`);
      }
    }
  }
}

export default ApiConnectionHelper;
