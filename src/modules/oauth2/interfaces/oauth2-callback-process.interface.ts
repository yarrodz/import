import SynchronizationContext from '../../synchronizations/interfaces/synchronization-context.interface';
import OAuth2SessionCallbackParams from './oauth2-session-callback-params.interface';

export default interface OAuth2CallbackProcess {
  state: string;
  context: SynchronizationContext;
  params: OAuth2SessionCallbackParams;
}
