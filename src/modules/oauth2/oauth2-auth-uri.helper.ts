import crypto from 'crypto';
import { Request } from 'express';

import { IImportDocument } from '../imports/import.schema';
import { IOAuth2 } from './oauth2.schema';
import OAuth2SessionHelper from './oauth2-session.helper';
import IOAuth2CallbackContext from '../imports/interfaces/import-context.interface';
import IOAuth2AuthUriParams from './interfaces/oauth2-auth-uri-params.interface';
import IOAuth2CallbackUriParams from './interfaces/oauth2-session-callback-params.interface';
import IOAuth2CallbackProcess from './interfaces/oauth2-callback-process.interface';

const PROMPT = 'consent';
const ACCESS_TYPE = 'offline';
const RESPONSE_TYPE = 'code';
const CODE_CHALANGE_METHOD = 'S256';
const OAUTH2_REDIRECT_URI = 'http://localhost:3000/oauth-callback/';

class OAuth2AuthUriHelper {
  public createUri = async (
    req: Request,
    impt: IImportDocument,
    context: IOAuth2CallbackContext
  ) => {
    const oAuth2SessionHelper = new OAuth2SessionHelper(req.session);
    const { oauth2 } = impt.api.auth;
    const { auth_uri, use_code_verifier } = oauth2;

    const state = crypto.randomBytes(100).toString('base64url');

    const authUriParams: IOAuth2AuthUriParams = this.createAuthUriParams(
      oauth2,
      state
    );

    const callbackParams: IOAuth2CallbackUriParams =
      this.createAuthCallbackParams(oauth2);

    if (use_code_verifier) {
      this.setCodeVerifier(authUriParams, callbackParams);
    }

    const oAuth2CallbackProcess: IOAuth2CallbackProcess = {
      state,
      context,
      params: callbackParams
    };
    oAuth2SessionHelper.addCallbackProcess(oAuth2CallbackProcess);

    const authUriQueryString = this.queryStringFromObject(authUriParams);
    const authUri = `${auth_uri}?${authUriQueryString}`;
    return authUri;
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

  private createAuthCallbackParams(oAuth2: IOAuth2): IOAuth2CallbackUriParams {
    const { client_id, client_secret, token_uri } = oAuth2;
    const callbackParams: IOAuth2CallbackUriParams = {
      client_id,
      token_uri
    };
    if (client_secret) {
      callbackParams.client_secret = client_secret;
    }

    return callbackParams;
  }

  private setCodeVerifier(
    authUriParams: IOAuth2AuthUriParams,
    callbackParams: IOAuth2CallbackUriParams
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

    callbackParams.code_verifier = code_verifier;
  }

  private queryStringFromObject(object: object) {
    return Object.keys(object)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
      )
      .join('&');
  }
}

export default OAuth2AuthUriHelper;
