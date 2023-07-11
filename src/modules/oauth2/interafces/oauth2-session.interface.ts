import { Session } from 'express-session';

import IOAuth2CallbackProcess from './oauth2-callback-process.interface';
import IOAuth2Tokens from './oauth2-token.interface';

export default interface IOAuth2Session extends Session {
  oAuth2CallbackProcesses?: IOAuth2CallbackProcess[];
  oAuth2Tokens?: IOAuth2Tokens[];
}
