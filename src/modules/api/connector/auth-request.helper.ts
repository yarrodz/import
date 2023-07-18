import { AxiosRequestConfig } from 'axios';

import { IRequestAuth } from '../sub-schemas/api-sub-schemas/request-auth.shema';
import { RequestAuthType } from '../enums/request-auth-type.enum';
import { ApiKeyPlacement } from '../enums/api-key-placement.enum';

class AuthRequestHelper {
  public async auth(request: AxiosRequestConfig, auth: IRequestAuth) {
    if (!auth) {
      return;
    }
    switch (auth.type) {
      case RequestAuthType.API_KEY: {
        this.apiKeyAuth(request, auth);
        break;
      }
      case RequestAuthType.BASIC: {
        this.basicAuth(request, auth);
        break;
      }
      case RequestAuthType.BEARER_TOKEN: {
        this.bearerAuth(request, auth);
        break;
      }
      case RequestAuthType.OAUTH2: {
        this.oauth2(request, auth);
        break;
      }
      default: {
        throw new Error('Error while authrizing request. Unknown auth type');
      }
    }
  }

  private apiKeyAuth(request: AxiosRequestConfig, auth: IRequestAuth) {
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

  private basicAuth(request: AxiosRequestConfig, auth: IRequestAuth) {
    request.auth = auth.basicDigest;
  }

  private bearerAuth(request: AxiosRequestConfig, auth: IRequestAuth) {
    const { token } = auth.bearer;
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${token}`;
  }

  private async oauth2(request: AxiosRequestConfig, auth: IRequestAuth) {
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
