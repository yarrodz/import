import axios, { AxiosRequestConfig } from 'axios';

import ConnectionsRepository from '../../connections/connections.repository';
import OAuth2RefreshTokenBody from '../interfaces/oauts2-refresh-token-body';
import ApiConnection from '../../api/interfaces/api-connection.interface';

const GRANT_TYPE = 'refresh_token';

class OAuth2RefreshTokenHelper {
  private connectionsRepository: ConnectionsRepository;

  constructor(connectionsRepository: ConnectionsRepository) {
    this.connectionsRepository = connectionsRepository;
  }

  public refresh = async (connection: ApiConnection) => {
    const { id: connectionId } = connection;
    const { oauth2 } = connection;
    const { client_id, client_secret, token_uri, refresh_token, scope } =
      oauth2;
    try {
      const body: OAuth2RefreshTokenBody = {
        grant_type: GRANT_TYPE,
        client_id,
        refresh_token
      };

      if (client_secret) {
        body.client_secret = client_secret;
      }

      if (scope) {
        body.scope = scope;
      }

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: token_uri,
        data: body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const response = await axios(config);

      const { access_token } = response.data;

      await this.connectionsRepository.update({
        id: connectionId,
        oauth2: {
          ...oauth2,
          access_token
        }
      });
    } catch (error) {
      await this.connectionsRepository.update({
        id: connectionId,
        oauth2: {
          ...oauth2,
          access_token: null,
          refresh_token: null
        }
      });
      throw new Error(
        `Error while refreshing oauth2 access token. Access and refresh tokens were removed: ${error.message}`
      );
    }
  };
}

export default OAuth2RefreshTokenHelper;
