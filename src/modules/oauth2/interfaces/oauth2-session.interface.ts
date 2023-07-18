import { Session } from 'express-session';

import IOAuth2CallbackProcess from './oauth2-callback-process.interface';

export default interface IOAuth2Session extends Session {
  oAuth2CallbackProcesses?: IOAuth2CallbackProcess[];
}
