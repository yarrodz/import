import IOAuth2CallbackContext from './oauth2-callback-context.interface';
import IOAuth2CallbackUriParams from './oauth2-callback-uri-params.interface';

export default interface IOAuth2CallbackProcess {
  state: string;
  context: IOAuth2CallbackContext;
  uriParams: IOAuth2CallbackUriParams;
}
