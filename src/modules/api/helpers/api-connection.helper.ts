import { OAuth2RefreshTokenHelper } from '../../oauth2/helpers/oath2-refresh-token.helper';
import { ApiIframeTransfer } from '../interfaces/api-iframe-transfer.interface';
import { ApiConnector } from '../connector/api-connector';
import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { TransferMethod } from '../../transfer-processes/enums/transfer-method.enum';
import { ApiConnection } from '../interfaces/api-connection.interface';
import { baseOffsetPagination } from '../../transfer-processes/constants/base-offset-pagination.constant';
import { baseCursorPagination } from '../../transfer-processes/constants/base-cursor-pagination.constnt';
import { Pagination } from '../../transfer-processes/interfaces/pagination.type';
import { TransfersRepository } from '../../transfers/transfers.repository';
import { Connectionstatus } from '../enums/connection-state.enum';

export class ApiConnectionHelper {
  constructor(
    private transfersRepository: TransfersRepository,
    private oAuth2RefreshTokenHelper: OAuth2RefreshTokenHelper,
  ) {}

  public async connect(transfer: ApiIframeTransfer): Promise<Connectionstatus> {
    try {
      const { __: relations } = transfer;
      const connection = relations.connection as ApiConnection;
      if (connection.type === ApiConnectionType.OAUTH2) {
        const { oauth2 } = connection;
        if (oauth2.access_token === undefined) {
          // If access token not exists - we have to receive it
          return Connectionstatus.OAUTH2_REQUIRED;
        } else {
          try {
            // If exists - send request
            await this.sendRequest(transfer);
            return Connectionstatus.CONNECTED;
          } catch (error) {
            if (oauth2.refresh_token === undefined) {
              // If api oauth2 does not have refresh tokens - access token never expire(Notion api);
              // Api transfer settings not correct
              throw error;
            } else {
              // Try to refresh access token
              try {
                await this.oAuth2RefreshTokenHelper.refresh(connection);
              } catch (error) {
                // The error while refreshing access token.
                // That means that refresh token was expired.
                return Connectionstatus.OAUTH2_REQUIRED;
              }
              // Send request with refreshed access token.
              // If request fails, token was not a fail reason. api transfer settings not correct
              transfer = await this.transfersRepository.load(
                transfer.id
              );
              await this.sendRequest(transfer);
              return Connectionstatus.CONNECTED;
            }
          }
        }
      } else {
        await this.sendRequest(transfer);
        return Connectionstatus.CONNECTED;
      }
    } catch (error) {
      throw new Error(`Error while connecting to API: ${error.message}`);
    }
  }

  private async sendRequest(transfer: ApiIframeTransfer) {
    const apiConnector = new ApiConnector(transfer);
    await apiConnector.authRequest();
    const cases = {
      [TransferMethod.OFFSET_PAGINATION]: baseOffsetPagination,
      [TransferMethod.CURSOR_PAGINATION]: baseCursorPagination
    };
    const { transferMethod } = transfer;
    const pagination: Pagination = cases[transferMethod];
    apiConnector.paginateRequest(pagination);
    await apiConnector.sendRequest();
  }
}


// case TransferMethod.CHUNK: {
//   await apiConnector.sendRequest();
//   break;
// }
