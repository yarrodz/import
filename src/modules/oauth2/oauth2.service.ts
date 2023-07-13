import axios, { AxiosBasicCredentials, AxiosRequestConfig } from 'axios';
import { Request } from 'express';

import OAuth2SessionHelper from './oauth2-session.helper';
import IOAuth2CallbackContext from '../imports/interfaces/import-context.interface';
import ResponseHandler from '../../utils/response-handler/response-handler';
import ImportsRepository from '../imports/imports.repository';
import IOAuth2CallbackBody from './interafces/oauth2-callback-body.interface';
import IOAuth2SessionCallbackParams from './interafces/oauth2-session-callback-params.interface';
import { ImportContextAction } from '../imports/enums/import-context-action.enum';

const GRANT_TYPE = 'authorization_code';
const OAUTH2_REDIRECT_URI = 'http://localhost:3000/oauth-callback/';

class OAuth2Service {
  private importsRepository: ImportsRepository;

  constructor(importsRepository: ImportsRepository) {
    this.importsRepository = importsRepository;
  }

  oAuth2Callback = async (req: Request) => {
    const responseHandler = new ResponseHandler();
    let context: IOAuth2CallbackContext;
    try {
      const { session, query } = req;
      const { code, state } = query;

      const oAuthSessionHelper = new OAuth2SessionHelper(session);
      const callbackProcess = oAuthSessionHelper.findCallbackProcess(
        state as string
      );

      if (callbackProcess === null) {
        const errorRedirectUri = this.createErrorRedirectUri();
        responseHandler.setRedirect(errorRedirectUri);
        return responseHandler;
      }

      const { params } = callbackProcess;
      const { token_uri } = params;
      context = callbackProcess.context;
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

      const basicCredetials: AxiosBasicCredentials | null =
        this.createBasicCredential(params);

      if (basicCredetials !== null) {
        config.auth = basicCredetials;
      }

      const response = await axios(config);

      const { access_token, bearer_token } = response.data;

      await this.importsRepository.update(importId as unknown as string, {
        'api.request.auth.oauth2.access_token': access_token
      });

      const successRedirectUri = this.createSuccessRedirectUri(context);
      responseHandler.setRedirect(successRedirectUri);
      return responseHandler;
    } catch (error) {
      const errorRedirectUri = this.createErrorRedirectUri(context);
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
      redirect_uri: OAUTH2_REDIRECT_URI
    };

    if (client_secret) {
      body.client_secret = client_secret;
    }

    if (code_verifier) {
      body.code_verifier = code_verifier;
    }

    return body;
  }

  private createBasicCredential(
    params: IOAuth2SessionCallbackParams
  ): AxiosBasicCredentials | null {
    const { client_id, client_secret } = params;
    if (client_secret === undefined) {
      return null;
    } else {
      return {
        username: client_id,
        password: client_secret
      };
    }
  }

  private createSuccessRedirectUri(context: IOAuth2CallbackContext) {
    const { action, importId, importProcessId } = context;
    switch (action) {
      case ImportContextAction.CONNECT: {
        return `http://localhost:4200/imports/connect/${importId}`;
      }
      case ImportContextAction.START: {
        return `http://localhost:4200/imports/start/${importId}`;
      }
      case ImportContextAction.CONNECT: {
        return `http://localhost:4200/processes/reload/${importProcessId}`;
      }
      case ImportContextAction.CONNECT: {
        return `http://localhost:4200/processes/retry/${importProcessId}`;
      }
      default: {
        throw new Error('Unknown contex action inside OAuth2 callback');
      }
    }
  }

  private createErrorRedirectUri(context?: IOAuth2CallbackContext) {
    if (context === undefined) {
      const errorMessage = 'Could not find callback context';
      return `http://localhost:4200/imports/errorMessage=${errorMessage}`;
    } else {
      const { action } = context;
      const errorMessage = 'Error while OAuth2 callback';

      switch (action) {
        case ImportContextAction.CONNECT:
        case ImportContextAction.START: {
          return `http://localhost:4200/imports/errorMessage=${errorMessage}`;
        }
        case ImportContextAction.RELOAD:
        case ImportContextAction.RETRY: {
          return `http://localhost:4200/processes/errorMessage=${errorMessage}`;
        }
        default: {
          throw new Error('Unknown contex action inside OAuth2 callback');
        }
      }
    }
  }
}

export default OAuth2Service;
