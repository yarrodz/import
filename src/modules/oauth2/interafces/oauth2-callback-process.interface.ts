import IImportContext from '../../imports/interfaces/import-context.interface';
import IOAuth2SessionCallbackParams from './oauth2-session-callback-params.interface';

export default interface IOAuth2CallbackProcess {
  state: string;
  context: IImportContext;
  params: IOAuth2SessionCallbackParams;
}
