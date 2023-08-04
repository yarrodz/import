import { AxiosRequestConfig } from 'axios';

import { ApiKeyPlacement } from '../enums/api-key-placement.enum';
import ApiConnection from '../interfaces/api-connection.interface';
import { ApiConnectionType } from '../enums/api-connection-type.enum';

class AuthRequestHelper {
  public static async auth(request: AxiosRequestConfig, auth?: ApiConnection) {
    if (auth === undefined) {
      return;
    }

    const { type } = auth;

    switch (type) {
      case ApiConnectionType.API_KEY: {
        this.apiKeyAuth(request, auth);
        break;
      }
      case ApiConnectionType.BASIC: {
        this.basicAuth(request, auth);
        break;
      }
      case ApiConnectionType.BEARER_TOKEN: {
        this.bearerAuth(request, auth);
        break;
      }
      case ApiConnectionType.OAUTH2: {
        this.oauth2(request, auth);
        break;
      }
      default: {
        throw new Error(
          `Error while authorizing request. Unknown auth type: ${type}.`
        );
      }
    }
  }

  private static apiKeyAuth(request: AxiosRequestConfig, auth: ApiConnection) {
    const { key, value, placement } = auth.apiKey;
    switch (placement) {
      case ApiKeyPlacement.HEADERS: {
        request.headers = request.headers || {};
        request.headers[key] = `${value}`;
        break;
      }
      case ApiKeyPlacement.QUERY_PARAMETERS: {
        request.params = request.params || {};
        request.params[key] = value;
        break;
      }
      default:
        throw new Error(
          'Error while setting API key in request. Unknown placement.'
        );
    }
  }

  private static basicAuth(request: AxiosRequestConfig, auth: ApiConnection) {
    const { basicDigest } = auth;
    request.auth = basicDigest;
  }

  private static bearerAuth(request: AxiosRequestConfig, auth: ApiConnection) {
    const { token } = auth.bearer;
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${token}`;
  }

  private static async oauth2(
    request: AxiosRequestConfig,
    auth: ApiConnection
  ) {
    const { access_token } = auth.oauth2;
    if (access_token) {
      request.headers = request.headers || {};
      request.headers.Authorization = `Bearer ${access_token}`;
    } else {
      throw new Error(
        'Error while OAuth2. Access token was not set in request.'
      );
    }
  }
}

export default AuthRequestHelper;
