import axios, { AxiosRequestConfig } from 'axios';
import { iFrameSynchronization, iFrameConnection } from 'iframe-ai';

import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import ApiConnection from '../../api/interfaces/api-connection.interface';
import OAuth2RefreshTokenBody from '../interfaces/oauts2-refresh-token-body';
import dbClient from '../../../utils/db-client/db-client';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

const GRANT_TYPE = 'refresh_token';

class OAuth2RefreshTokenHelper {
  constructor() {}

  public refresh = async (synchronization: Synchronization) => {
    const { id: synchronizationId } = synchronization;
    const connection = synchronization.connection as ApiConnection;
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

      let connection = await iFrameSynchronization(
        dbClient,
        {},
        synchronizationId
      ).getConnection();
      connection = transformIFrameInstance(connection);

      await iFrameConnection(
        dbClient,
        {
          oauth2: {
            access_token
          }
        },
        connection.id
      ).save();
    } catch (error) {
      let connection = await iFrameSynchronization(
        dbClient,
        {},
        synchronizationId
      ).getConnection();
      connection = transformIFrameInstance(connection);

      await iFrameConnection(
        dbClient,
        {
          oauth2: {
            access_token: null,
            refresh_token: null
          }
        },
        connection.id
      ).save();
      throw new Error(
        `Error while refreshing oauth2 access token. Access and refresh tokens were removed: ${error.message}`
      );
    }
  };
}

export default OAuth2RefreshTokenHelper;
