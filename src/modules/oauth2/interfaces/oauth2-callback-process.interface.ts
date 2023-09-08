import { Context } from '../../imports/interfaces/context.interface';
import { OAuth2SessionCallbackParams } from './oauth2-session-callback-params.interface';

export interface OAuth2CallbackProcess {
  state: string;
  context: Context;
  params: OAuth2SessionCallbackParams;
}
