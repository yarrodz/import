import { Connection } from '../../connections/interfaces/connection.inteface';
import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { OAuth2 } from '../../oauth2/interfaces/oauth2.interface';
import { ApiKey } from './connection/api-key.interface';
import { BasicDigest } from './connection/basic-digest.inteface';
import { Bearer } from './connection/bearer.interface';

export interface ApiConnection extends Connection {
  type: ApiConnectionType;

  apiKey?: ApiKey;
  basicDigest?: BasicDigest;
  bearer?: Bearer;
  oauth2?: OAuth2;
}
