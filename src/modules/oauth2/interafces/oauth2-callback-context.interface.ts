import { Types } from 'mongoose';

import { OAuth2CallbackContextAction } from '../enums/oauth2-callback-context-action.enum';

export default interface IOAuth2CallbackContext {
  action: OAuth2CallbackContextAction;
  importId: Types.ObjectId;
  importProcessId?: Types.ObjectId;
}
