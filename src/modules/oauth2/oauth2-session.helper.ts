import { Session } from 'express-session';
import { Types } from 'mongoose';

import IOAuth2Session from './interafces/oauth2-session.interface';
import IOAuth2CallbackProcess from './interafces/oauth2-callback-process.interface';
import IOAuth2Token from './interafces/oauth2-token.interface';

class OAuth2SessionHelper {
  private session: IOAuth2Session;

  constructor(session: Session) {
    this.session = session;
  }

  public addCallbackProcess(process: IOAuth2CallbackProcess) {
    this.session.oAuth2CallbackProcesses =
      this.session.oAuth2CallbackProcesses || [];

    //remove OAuth2 process if exists
    this.session.oAuth2CallbackProcesses.filter(
      (p) => p.context.importId !== process.context.importId
    );
    this.session.oAuth2CallbackProcesses.push(process);
  }

  public findCallbackProcess(state: string) {
    if (this.session.oAuth2CallbackProcesses === undefined) {
      return null;
    }
    const callbackProcess = this.session.oAuth2CallbackProcesses.find(
      (p) => p.state === state
    );

    if (callbackProcess === undefined) {
      return null;
    }
    return callbackProcess;
  }

  public addTokens(token: IOAuth2Token) {
    this.session.oAuth2Tokens = this.session.oAuth2Tokens || [];
    this.session.oAuth2Tokens = this.session.oAuth2Tokens.filter(
      (t) => t.importId !== token.importId
    );
    this.session.oAuth2Tokens.push(token);
  }

  public findTokens(importId: Types.ObjectId) {
    if (this.session.oAuth2Tokens === undefined) {
      return null;
    }
    const token = this.session.oAuth2Tokens.find(
      (t) => t.importId === importId
    );

    if (token === undefined) {
      return null;
    }
    return token;
  }

  public removeTokens(importId: Types.ObjectId) {
    this.session.oAuth2Tokens = this.session.oAuth2Tokens.filter(
      (t) => t.importId !== importId
    );
  }
}

export default OAuth2SessionHelper;
