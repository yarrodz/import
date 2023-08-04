import { Session } from 'express-session';

import OAuth2CallbackProcess from './oauth2-callback-process.interface';

export default interface OAuth2Session extends Session {
  oAuth2CallbackProcesses?: OAuth2CallbackProcess[];
}
