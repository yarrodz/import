import { Request } from 'express';
import axios, { AxiosBasicCredentials, AxiosRequestConfig } from 'axios';

import OAuth2SessionHelper from './oauth2-session.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import ImportsRepository from '../imports/imports.repository';
import IOAuth2CallbackBody from './interfaces/oauth2-callback-body.interface';
import IOAuth2SessionCallbackParams from './interfaces/oauth2-session-callback-params.interface';
import { ImportContextAction } from '../imports/enums/import-context-action.enum';
import IOAuth2CallbackProcess from './interfaces/oauth2-callback-process.interface';

const GRANT_TYPE = 'authorization_code';
const OAUTH2_REDIRECT_URI = 'http://localhost:3000/oauth-callback/';

class OAuth2Service {
  private importsRepository: ImportsRepository;
  private oAuth2RedirectUri: string;
  private clientUri: string;

  constructor(
    importsRepository: ImportsRepository,
    oAuth2RedirectUri: string,
    clientUri: string
  ) {
    this.importsRepository = importsRepository;
    this.oAuth2RedirectUri = oAuth2RedirectUri;
    this.clientUri = clientUri;
  }

  oAuth2Callback = async (req: Request) => {
    const responseHandler = new ResponseHandler();
    let callbackProcess: IOAuth2CallbackProcess;
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
      const { importId } = context;

      const body: IOAuth2CallbackBody = this.createCallbackBody(
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
        } as AxiosBasicCredentials;
      }

      const response = await axios(config);

      const { access_token, refresh_token } = response.data;

      await this.importsRepository.update(importId as string, {
        'api.auth.oauth2.access_token': access_token,
        'api.auth.oauth2.refresh_token': refresh_token
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
    params: IOAuth2SessionCallbackParams
  ): IOAuth2CallbackBody {
    const { client_id, client_secret, code_verifier } = params;

    const body: IOAuth2CallbackBody = {
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

  private createSuccessRedirectUri(callbackProcess: IOAuth2CallbackProcess) {
    const { context } = callbackProcess;
    const { action, importId, processId } = context;
    switch (action) {
      case ImportContextAction.CONNECT: {
        return `${this.clientUri}imports/connect/${importId}`;
      }
      case ImportContextAction.START: {
        return `${this.clientUri}imports/start/${importId}`;
      }
      case ImportContextAction.RELOAD: {
        return `${this.clientUri}processes/reload/${processId}`;
      }
      case ImportContextAction.RETRY: {
        return `${this.clientUri}processes/retry/${processId}`;
      }
      default: {
        throw new Error('Unknown contex action inside OAuth2 callback');
      }
    }
  }

  private createErrorRedirectUri(callbackProcess?: IOAuth2CallbackProcess) {
    if (callbackProcess === undefined) {
      const errorMessage = 'Could not find callback context';
      return `${this.clientUri}imports/errorMessage=${errorMessage}`;
    } else {
      const { context } = callbackProcess;
      const { action } = context;
      const errorMessage = 'Error while OAuth2 callback';

      switch (action) {
        case ImportContextAction.CONNECT:
        case ImportContextAction.START: {
          return `${this.clientUri}imports/errorMessage=${errorMessage}`;
        }
        case ImportContextAction.RELOAD:
        case ImportContextAction.RETRY: {
          return `${this.clientUri}processes/errorMessage=${errorMessage}`;
        }
        default: {
          throw new Error('Unknown contex action inside OAuth2 callback');
        }
      }
    }
  }
}

export default OAuth2Service;
