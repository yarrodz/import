import { Context } from './context.interface';
import { OAuth2SessionCallbackParams } from './oauth2-session-callback-params.interface';

export interface OAuth2CallbackProcess {
  status: string;
  context: Context;
  params: OAuth2SessionCallbackParams;
}
