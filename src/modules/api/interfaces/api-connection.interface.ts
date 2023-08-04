import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { OAuth2 } from '../../oauth2/interfaces/oauth2.interface';
import ApiKey from './connection/api-key.interface';
import BasicDigest from './connection/basic-digest.inteface';
import Bearer from './connection/bearer.interface';

export default interface ApiConnection {
  id: string;
  type: ApiConnectionType;
  apiKey?: ApiKey;
  basicDigest?: BasicDigest;
  bearer?: Bearer;
  oauth2?: OAuth2;
}
