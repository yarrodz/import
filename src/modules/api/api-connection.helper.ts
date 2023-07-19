import ImportsRepository from '../imports/imports.repository';
import OAuth2RefreshTokenHelper from '../oauth2/oath2-refresh-token.helper';
import { IImportDocument } from '../imports/import.schema';
import ApiConnector from './connector/api-connector';
import { IApi } from './api.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import { RequestAuthType } from './enums/request-auth-type.enum';
import { ConnectionState } from '../connection/connection-state.enum';
import ICursorPagination from '../transfer/interfaces/cursor-pagination.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';

class ApiConnectionHelper {
  private importsRepository: ImportsRepository;
  private oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper;

  constructor(
    importsRepository: ImportsRepository,
    oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper
  ) {
    this.importsRepository = importsRepository;
    this.oAuth2RefreshTokenHelper = oAuth2RefreshTokenHelper;
  }

  public async connect(impt: IImportDocument): Promise<ConnectionState> {
    try {
      const { api, _id: importId } = impt;
      let { transferType, auth } = api;
      console.log(transferType);

      if (auth?.type === RequestAuthType.OAUTH2) {
        const { oauth2 } = auth;
        if (!oauth2.access_token) {
          return ConnectionState.OAUTH2_REQUIRED;
        } else {
          try {
            await this.sendRequest(api, transferType);
            return ConnectionState.CONNECTED;
          } catch (error) {
            try {
              await this.oAuth2RefreshTokenHelper.refresh(impt);
            } catch (error) {
              return ConnectionState.OAUTH2_REQUIRED;
            }
            const refreshedImport = await this.importsRepository.findById(
              importId
            );
            const { api } = refreshedImport;
            await this.sendRequest(api, transferType);
          }
        }
      } else {
        await this.sendRequest(api, transferType);
      }
      return ConnectionState.CONNECTED;
    } catch (error) {
      throw new Error(`Error while connecting to API: ${error.message}`);
    }
  }

  private async sendRequest(api: IApi, transferType: TransferType) {
    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();
    switch (transferType) {
      case TransferType.CHUNK: {
        await apiConnector.send();
        break;
      }
      case TransferType.OFFSET_PAGINATION: {
        const pagination: IOffsetPagination = {
          offset: 0,
          limit: 1
        };
        await apiConnector.send(pagination);
        break;
      }
      case TransferType.CURSOR_PAGINATION: {
        const pagination: ICursorPagination = {
          limit: 1
        };
        await apiConnector.send(pagination);
        break;
      }
      default: {
        throw new Error(`Unknown API transfer type: '${transferType}'.`);
      }
    }
  }
}

export default ApiConnectionHelper;
