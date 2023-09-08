import { ApiConnectionType } from '../enums/api-connection-type.enum';
import { OAuth2 } from '../../oauth2/interfaces/oauth2.interface';
import { ApiKey } from './connection/api-key.interface';
import { BasicDigest } from './connection/basic-digest.inteface';
import { Bearer } from './connection/bearer.interface';
import { Source } from '../../imports/enums/source.enum';
import { ConnectionReference } from '../../connections/interfaces/connection.reference.interface';

export interface ApiConnection {
  id: number;

  name: string;

  source: Source.API;

  type: ApiConnectionType;

  apiKey?: ApiKey;
  basicDigest?: BasicDigest;
  bearer?: Bearer;
  oauth2?: OAuth2;

  __: ConnectionReference;
}
