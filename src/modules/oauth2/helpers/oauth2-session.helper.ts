import { Session } from 'express-session';
import { OAuth2Session } from '../interfaces/oauth2-session.interface';
import { OAuth2CallbackProcess } from '../interfaces/oauth2-callback-process.interface';

export class OAuth2SessionHelper {
  private session: OAuth2Session;

  constructor(session: Session) {
    this.session = session;
  }

  public addCallbackProcess(process: OAuth2CallbackProcess): void {
    this.session.oAuth2CallbackProcesses =
      this.session.oAuth2CallbackProcesses || [];

    //remove OAuth2 process by connectionId if exists
    this.session.oAuth2CallbackProcesses =
      this.session.oAuth2CallbackProcesses.filter(
        (p) => p.context.connectionId !== process.context.connectionId
      );

    this.session.oAuth2CallbackProcesses.push(process);
  }

  public findCallbackProcess(state: string): OAuth2CallbackProcess | undefined {
    if (this.session.oAuth2CallbackProcesses === undefined) {
      throw new Error('Callback process was not found in session.');
    }

    const callbackProcess = this.session.oAuth2CallbackProcesses.find(
      (p) => p.state === state
    );

    if (callbackProcess === undefined) {
      throw new Error('Callback process was not found in session.');
    }
    return callbackProcess;
  }

  public removeCallbackProcess(state: string): void {
    this.session.oAuth2CallbackProcesses =
      this.session.oAuth2CallbackProcesses.filter((p) => p.state !== state);
  }
}
