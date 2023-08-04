import { Request } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import { iFrameConnection, iFrameSynchronization } from 'iframe-ai';

import ResponseHandler from '../../utils/response-handler/response-handler';
import OAuth2CallbackProcess from './interfaces/oauth2-callback-process.interface';
import OAuth2CallbackBody from './interfaces/oauth2-callback-body.interface';
import dbClient from '../../utils/db-client/db-client';
import OAuth2SessionHelper from './helpers/oauth2-session.helper';
import OAuth2SessionCallbackParams from './interfaces/oauth2-session-callback-params.interface';
import { SynchronizationContextAction } from '../synchronizations/enums/synchronization-context-action.enum';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

const GRANT_TYPE = 'authorization_code';
const OAUTH2_REDIRECT_URI = 'http://localhost:3000/oauth-callback/';

class OAuth2Service {
  private oAuth2RedirectUri: string;
  private clientUri: string;

  constructor(oAuth2RedirectUri: string, clientUri: string) {
    this.oAuth2RedirectUri = oAuth2RedirectUri;
    this.clientUri = clientUri;
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
      const { synchronizationId } = context;

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

      let connection = await new iFrameSynchronization(
        dbClient,
        {},
        synchronizationId
      ).getConnection();
      connection = transformIFrameInstance(connection);

      await new iFrameConnection(
        dbClient,
        {
          oauth2: {
            access_token,
            refresh_token
          }
        },
        connection.id
      ).save();

      const successRedirectUri = this.createSuccessRedirectUri(callbackProcess);
      responseHandler.setRedirect(successRedirectUri);
      return responseHandler;
    } catch (error) {
      console.error('error: ', error);
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
    const { action, synchronizationId, transferId } = context;
    switch (action) {
      case SynchronizationContextAction.CONNECT: {
        return `${this.clientUri}imports/Connect/${synchronizationId}`;
      }
      case SynchronizationContextAction.IMPORT: {
        return `${this.clientUri}imports/start/${synchronizationId}`;
      }
      case SynchronizationContextAction.RELOAD: {
        return `${this.clientUri}processes/reload/${transferId}`;
      }
      case SynchronizationContextAction.RETRY: {
        return `${this.clientUri}processes/retry/${transferId}`;
      }
      default: {
        throw new Error('Unknown contex action inside OAuth2 callback');
      }
    }
  }

  private createErrorRedirectUri(callbackProcess?: OAuth2CallbackProcess) {
    if (callbackProcess === undefined) {
      const errorMessage = 'Could not find callback context';
      return `${this.clientUri}imports/errorMessage=${errorMessage}`;
    } else {
      const { context } = callbackProcess;
      const { action } = context;
      const errorMessage = 'Error while OAuth2 callback';

      switch (action) {
        case SynchronizationContextAction.CONNECT:
        case SynchronizationContextAction.IMPORT: {
          return `${this.clientUri}imports/error/message=${errorMessage}`;
        }
        case SynchronizationContextAction.RELOAD:
        case SynchronizationContextAction.RETRY: {
          return `${this.clientUri}processes/error/message=${errorMessage}`;
        }
        default: {
          throw new Error('Unknown contex action inside OAuth2 callback');
        }
      }
    }
  }
}

export default OAuth2Service;
