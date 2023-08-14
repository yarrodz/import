import crypto from 'crypto';
import { Request } from 'express';

import OAuth2SessionHelper from './oauth2-session.helper';
import OAuth2SessionCallbackParams from '../interfaces/oauth2-session-callback-params.interface';
import OAuth2CallbackProcess from '../interfaces/oauth2-callback-process.interface';
import OAuth2AuthUriParams from '../interfaces/oauth2-auth-uri-params.interface';
import ApiConnection from '../../api/interfaces/api-connection.interface';
import { OAuth2 } from '../interfaces/oauth2.interface';
import Context from '../../imports/interfaces/context.interface';

const PROMPT = 'consent';
const ACCESS_TYPE = 'offline';
const RESPONSE_TYPE = 'code';
const CODE_CHALANGE_METHOD = 'S256';

class OAuth2AuthUriHelper {
  private oAuth2RedirectUri: string;

  constructor(oAuth2RedirectUri: string) {
    this.oAuth2RedirectUri = oAuth2RedirectUri;
  }

  public createUri = async (
    req: Request,
    connection: ApiConnection,
    context: Context
  ) => {
    const oAuth2SessionHelper = new OAuth2SessionHelper(req.session);
    const { oauth2 } = connection;
    const { auth_uri, use_code_verifier } = oauth2;

    const state = crypto.randomBytes(100).toString('base64url');

    const authUriParams: OAuth2AuthUriParams = this.createAuthUriParams(
      oauth2,
      state
    );

    const callbackParams: OAuth2SessionCallbackParams =
      this.createAuthCallbackParams(oauth2);

    if (use_code_verifier) {
      this.setCodeVerifier(authUriParams, callbackParams);
    }

    const oAuth2CallbackProcess: OAuth2CallbackProcess = {
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
    oAuth2: OAuth2,
    state: string
  ): OAuth2AuthUriParams {
    const { client_id, scope } = oAuth2;
    const authUriParams: OAuth2AuthUriParams = {
      client_id,
      state,
      prompt: PROMPT,
      access_type: ACCESS_TYPE,
      response_type: RESPONSE_TYPE,
      redirect_uri: this.oAuth2RedirectUri
    };

    if (scope) {
      authUriParams.scope = scope;
    }

    return authUriParams;
  }

  private createAuthCallbackParams(
    oAuth2: OAuth2
  ): OAuth2SessionCallbackParams {
    const { client_id, client_secret, token_uri } = oAuth2;
    const callbackParams: OAuth2SessionCallbackParams = {
      client_id,
      token_uri
    };
    if (client_secret) {
      callbackParams.client_secret = client_secret;
    }

    return callbackParams;
  }

  private setCodeVerifier(
    authUriParams: OAuth2AuthUriParams,
    callbackParams: OAuth2SessionCallbackParams
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
