import { Session } from 'express-session';

import IOAuth2Session from './interafces/oauth2-session.interface';
import IOAuth2CallbackProcess from './interafces/oauth2-callback-process.interface';

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
}

export default OAuth2SessionHelper;
