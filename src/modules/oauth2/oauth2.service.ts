import crypto from 'crypto';
import axios from 'axios';
import { Request } from 'express';

import { IOAuth2 } from './oauth2.schema';
import OAuth2SessionHelper from './oauth2-session.helper';
import IOAuth2CallbackContext from './interafces/oauth2-callback-context.interface';
import IOAuth2AuthUriParams from './interafces/oauth2-auth-uri-params.interface';
import IOAuth2CallbackUriParams from './interafces/oauth2-callback-uri-params.interface';
import IOAuth2CallbackProcess from './interafces/oauth2-callback-process.interface';
import ResponseHandler from '../../utils/response-handler/response-handler';
import IOAuth2Token from './interafces/oauth2-token.interface';
import { OAuth2CallbackContextAction } from './enums/oauth2-callback-context-action.enum';

const PROMPT = 'consent';
const ACCESS_TYPE = 'offline';
const RESPONSE_TYPE = 'code';
const CODE_CHALANGE_METHOD = 'S256';
const GRANT_TYPE = 'authorization_code';
const OAUTH2_REDIRECT_URI = 'http://localhost:3000/oauth-callback/';

const IMPORTS_URI = 'http://localhost:4200/';
const IMPORT_PROCESSES_URI = 'http://localhost:4200/';

class OAuth2Service {
  public oAuth2AuthUriRedirect = async (
    req: Request,
    oAuth2: IOAuth2,
    context: IOAuth2CallbackContext
  ) => {
    const responseHandler = new ResponseHandler();
    try {
      const oAuthSessionHelper = new OAuth2SessionHelper(req.session);
      const { auth_uri, use_code_verifier } = oAuth2;

      const state = crypto.randomBytes(100).toString('base64url');

      const authUriParams: IOAuth2AuthUriParams = this.createAuthUriParams(
        oAuth2,
        state
      );
      const callbackUriParams: IOAuth2CallbackUriParams =
        this.createSessionCallbackUriParams(oAuth2);

      if (use_code_verifier) {
        this.setCodeVerifier(authUriParams, callbackUriParams);
      }

      const oAuth2CallbackProcess: IOAuth2CallbackProcess = {
        state,
        context,
        uriParams: callbackUriParams
      };
      oAuthSessionHelper.addCallbackProcess(oAuth2CallbackProcess);

      const authUriQueryString = this.queryStringFromObject(authUriParams);
      const authUri = `${auth_uri}?${authUriQueryString}`;

      responseHandler.setRedirect(authUri);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  };

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

      const { uriParams } = callbackProcess;
      context = callbackProcess.context;
      const { token_uri } = uriParams;
      const { importId } = context;

      const params = this.createCallbackUriParams(code as string, uriParams);

      const tokenResponse = await axios({
        method: 'POST',
        url: token_uri,
        params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token } = tokenResponse.data;

      const oAuth2Token: IOAuth2Token = {
        importId,
        access: access_token,
        refresh: refresh_token
      };

      oAuthSessionHelper.addTokens(oAuth2Token);

      const successRedirectUri = this.createSuccessRedirectUri(context);
      responseHandler.setRedirect(successRedirectUri);
      return responseHandler;
    } catch (error) {
      console.error(error);

      const errorRedirectUri = this.createErrorRedirectUri(context);
      responseHandler.setRedirect(errorRedirectUri);
      return responseHandler;
    }
  };

  private createAuthUriParams(
    oAuth2: IOAuth2,
    state: string
  ): IOAuth2AuthUriParams {
    const { client_id, scope } = oAuth2;
    const authUriParams: IOAuth2AuthUriParams = {
      client_id,
      state,
      prompt: PROMPT,
      access_type: ACCESS_TYPE,
      response_type: RESPONSE_TYPE,
      redirect_uri: OAUTH2_REDIRECT_URI
    };

    if (scope) {
      authUriParams.scope = scope;
    }

    return authUriParams;
  }

  private createSessionCallbackUriParams(
    oAuth2: IOAuth2
  ): IOAuth2CallbackUriParams {
    const { client_id, client_secret, token_uri } = oAuth2;
    const callbackUriParams: IOAuth2CallbackUriParams = {
      client_id,
      token_uri
    };
    if (client_secret) {
      callbackUriParams.client_secret = client_secret;
    }

    return callbackUriParams;
  }

  private setCodeVerifier(
    authUriParams: IOAuth2AuthUriParams,
    callbackUriParams: IOAuth2CallbackUriParams
  ) {
    const code_verifier = crypto.randomBytes(96).toString('base64url');
    const code_challenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    authUriParams.code_challenge_method = CODE_CHALANGE_METHOD;
    authUriParams.code_challenge = code_challenge;
    authUriParams.code_verifier = code_verifier;

    callbackUriParams.code_verifier = code_verifier;
  }

  private queryStringFromObject(object: object) {
    return Object.keys(object).map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
      )
      .join('&');
  }

  private createCallbackUriParams(
    code: string,
    savedUriParams: IOAuth2CallbackUriParams
  ) {
    const { client_id, client_secret, code_verifier } = savedUriParams;

    const params = {
      code,
      client_id,
      grant_type: GRANT_TYPE,
      redirect_uri: OAUTH2_REDIRECT_URI
    };

    if (client_secret) {
      params['client_secret'] = client_secret;
    }

    if (code_verifier) {
      params['code_verifier'] = code_verifier;
    }

    return params;
  }

  private createSuccessRedirectUri(context: IOAuth2CallbackContext) {
    const { action, importId, importProcessId } = context;
    switch (action) {
      case OAuth2CallbackContextAction.CONNECT: {
        return `${IMPORTS_URI}connect/${importId}`;
      }
      case OAuth2CallbackContextAction.START: {
        return `${IMPORTS_URI}start/${importId}`;
      }
      case OAuth2CallbackContextAction.CONNECT: {
        return `${IMPORT_PROCESSES_URI}reload/${importProcessId}`;
      }
      case OAuth2CallbackContextAction.CONNECT: {
        return `${IMPORT_PROCESSES_URI}retry/${importProcessId}`;
      }
      default: {
        throw new Error('Unknown contex action inside OAuth2 callback');
      }
    }
  }

  private createErrorRedirectUri(context: IOAuth2CallbackContext) {
    const { action } = context;
    const errorMessage = 'Error while OAuth2 callback';
    switch (action) {
      case OAuth2CallbackContextAction.CONNECT:
      case OAuth2CallbackContextAction.START: {
        return `${IMPORTS_URI}errorMessage=${errorMessage}`;
      }
      case OAuth2CallbackContextAction.RELOAD:
      case OAuth2CallbackContextAction.RETRY: {
        return `${IMPORT_PROCESSES_URI}errorMessage=${errorMessage}`;
      }
      default: {
        throw new Error('Unknown contex action inside OAuth2 callback');
      }
    }
  }
}

// const tokenResponse = await axios.post(token_uri, qs.stringify(params), {
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded'
//   }
// });
export default OAuth2Service;

// Server generates and redirect the client to the authorize URL
// and save the parameters needed for the token request and context parameters in the session.
//oauthCallbackProcesses: [{
// context: {
// action: 'connect' | 'start' | 'reload' | 'retry',
// importId: ObjectId(ewfewfewfewf),
// importProcessId?: ObjectId(ewfewfewfewf),
// },
// uriParams: {
// client_id: 'fwefweffewfew',
// client_secret?: 'fwefewfewfew',
// code_verifier?: 'fefefwefew',
// state: 'fewfweweffew',
// token_uri: 'http:/token.uri',
// },
//}]

// After the user chooses their account and is redirected to the OAuth2 callback endpoint,
// the callback endpoint will retrieve the callback parameters from the express session.

// Send a request to the token URI with the received parameters.

// Once the tokens from the token URI is received, save the token in the session with the importId.
//oAuth2Tokens: [{
// importId: ObjectId(ewfewfewfewf),
// access: 'efwfew',
// refresh: 'fereerfrwef'
//}]

// Generate path parameters using the context from the session.

// Redirect the client back to the specified URI with the path parameters
// that inform the client what actions it needs to take
// (connect/importId, start/importId, reload/importProcessId, retry/importProcessId).

// When the client sends the request again,
// the server endpoint searches if the token exists in the session
// and extracts by importId tokens from the session.

// Start execution of function with the token.
