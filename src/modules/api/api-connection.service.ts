import { Request } from 'express';

import { IImport } from '../imports/import.schema';
import IOAuth2CallbackContext from '../imports/interfaces/import-context.interface';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import ApiConnector from './connector/api-connector';
import IPagination from '../transfer/interfaces/pagination.interface';
import { RequestAuthType } from './enums/request-auth-type.enum';
import IConnectionResult from '../connection/interfaces/connection-result.interface';
import OAuth2AuthUriHelper from '../oauth2/oauth2-auth-uri.helper';
import { ConnectionState } from '../connection/enums/connection-state.enum';

class ApiConnectionSerice {
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;

  constructor(oAuth2AuthUriHelper: OAuth2AuthUriHelper) {
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
  }

  public async connect(
    req: Request,
    impt: Omit<IImport, 'fields'>,
    context: IOAuth2CallbackContext
  ): Promise<IConnectionResult> {
    try {
      const { api } = impt;
      const { request, transferType } = api;
      const { auth } = request;
      

      if (auth?.type === RequestAuthType.OAUTH2) {
        const { oauth2 } = auth;

        if (!oauth2.access_token) {
          const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
            req,
            oauth2,
            context
          );
          const connectionResult: IConnectionResult = {
            state: ConnectionState.OAUTH2_REQUIRED,
            oAuth2AuthUri
          };
          return connectionResult;
        }
      }

      const apiConnector = new ApiConnector(request);
      await apiConnector.authorizeRequest();
      switch (transferType) {
        case TransferType.CHUNK: {
          await apiConnector.send();
          break;
        }
        case TransferType.PAGINATION: {
          const pagination: IPagination = {
            offset: 0,
            limit: 1
          };
          await apiConnector.send(pagination);
          break;
        }
        // case TransferType.STREAM: {
        //   response = await this.findStreamColumns(api);
        //   break;
        // }
        default: {
          throw new Error('Unknown transfer type for API.');
        }
      }

      const connectionResult: IConnectionResult = {
        state: ConnectionState.CONNECTED
      };
      return connectionResult;
    } catch (error) {
      throw new Error(`Error while connecting to API: ${error.message}`);
    }
  }
}

export default ApiConnectionSerice;
