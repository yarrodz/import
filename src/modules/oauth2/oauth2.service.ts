import { Request } from 'express';
import axios, { AxiosRequestConfig } from 'axios';

import { ConnectionsRepository } from '../connections/connections.repository';
import { OAuth2CallbackProcess } from './interfaces/oauth2-callback-process.interface';
import { OAuth2CallbackBody } from './interfaces/oauth2-callback-body.interface';
import { OAuth2SessionCallbackParams } from './interfaces/oauth2-session-callback-params.interface';
import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { ContextAction } from '../imports/enums/context-action-enum';
import { OAuth2SessionHelper } from './helpers/oauth2-session.helper';

const GRANT_TYPE = 'authorization_code';

export class OAuth2Service {
  private oAuth2RedirectUri: string;
  private clientUri: string;
  private connectionsRepository: ConnectionsRepository;

  constructor(
    oAuth2RedirectUri: string,
    clientUri: string,
    connectionsRepository: ConnectionsRepository
  ) {
    this.oAuth2RedirectUri = oAuth2RedirectUri;
    this.clientUri = clientUri;
    this.connectionsRepository = connectionsRepository;
  }

  oAuth2Callback = async (req: Request) => {
    const responseHandler = new ResponseHandler();
    let callbackProcess: OAuth2CallbackProcess;
    try {
      const { session, query } = req;
      const { code, state } = query;

      const oAuth2SessionHelper = new OAuth2SessionHelper(session);
      callbackProcess = oAuth2SessionHelper.findCallbackProcess(
        state as string
      );
      oAuth2SessionHelper.removeCallbackProcess(state as string);

      const { params, context } = callbackProcess;
      const { token_uri, client_id, client_secret } = params;
      const { connectionId } = context;

      const body: OAuth2CallbackBody = this.createCallbackBody(
        code as string,
        params
      );

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: token_uri,
        data: body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      if (client_secret) {
        config.auth = {
          username: client_id,
          password: client_secret
        };
      }

      const response = await axios(config);

      const { access_token, refresh_token } = response.data;

      const connectionBefore = await this.connectionsRepository.load(
        connectionId
      );
      const { oauth2 } = connectionBefore;

      await this.connectionsRepository.update({
        id: connectionId,
        oauth2: {
          ...oauth2,
          access_token,
          refresh_token
        }
      });

      const successRedirectUri = this.createSuccessRedirectUri(callbackProcess);
      responseHandler.setRedirect(successRedirectUri);
      return responseHandler;
    } catch (error) {
      const errorRedirectUri = this.createErrorRedirectUri(callbackProcess);
      responseHandler.setRedirect(errorRedirectUri);
      return responseHandler;
    }
  };

  private createCallbackBody(
    code: string,
    params: OAuth2SessionCallbackParams
  ): OAuth2CallbackBody {
    const { client_id, client_secret, code_verifier } = params;

    const body: OAuth2CallbackBody = {
      code,
      client_id,
      grant_type: GRANT_TYPE,
      redirect_uri: this.oAuth2RedirectUri
    };

    if (client_secret) {
      body.client_secret = client_secret;
    }

    if (code_verifier) {
      body.code_verifier = code_verifier;
    }

    return body;
  }

  private createSuccessRedirectUri(callbackProcess: OAuth2CallbackProcess) {
    const { context } = callbackProcess;
    const { action, importId, transferId } = context;

    switch (action) {
      case ContextAction.GET_COLUMNS: {
        return `${this.clientUri}imports/get_columns/${importId}`;
      }
      case ContextAction.IMPORT: {
        return `${this.clientUri}imports/import/${importId}`;
      }
      case ContextAction.RELOAD: {
        return `${this.clientUri}transfers/reload/${transferId}`;
      }
      case ContextAction.RETRY: {
        return `${this.clientUri}transfers/retry/${transferId}`;
      }
      default: {
        throw new Error('Unknown contex action inside OAuth2 callback');
      }
    }
  }

  private createErrorRedirectUri(callbackProcess?: OAuth2CallbackProcess) {
    if (callbackProcess === undefined) {
      const errorMessage = 'Could not find callback context';
      return `${this.clientUri}imports/${errorMessage}`;
    } else {
      const { context } = callbackProcess;
      const { action } = context;

      const errorMessage = 'Error while OAuth2 callback';

      switch (action) {
        case ContextAction.GET_COLUMNS:
        case ContextAction.IMPORT: {
          return `${this.clientUri}imports/${errorMessage}`;
        }
        case ContextAction.RELOAD:
        case ContextAction.RETRY: {
          return `${this.clientUri}imports/${errorMessage}`;
        }
        default: {
          const errorMessage = 'Unknown contex action inside OAuth2 callback';
          return `${this.clientUri}imports/${errorMessage}`;
        }
      }
    }
  }
}
