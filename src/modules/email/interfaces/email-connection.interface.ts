import { ConnectionReference } from '../../connections/interfaces/connection.reference.interface';
import { Source } from '../../imports/enums/source.enum';

export interface EmailConnection {
  id: number;

  name: string;

  source: Source.EMAIL;

  config: {
    auth: {
      user: string;
      password: string;
    };
    host: string;
    port: number;
  };

  __: ConnectionReference;
}
