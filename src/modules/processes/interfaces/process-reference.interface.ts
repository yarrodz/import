import { ApiConnection } from '../../api/interfaces/api-connection.interface';
import { EmailConnection } from '../../email/interfaces/email-connection.interface';
import { SqlConnection } from '../../sql/interfaces/sql.connection.interface';

export interface ProcessReference {
  inUnit?: any;
  hasConnection?: SqlConnection | ApiConnection | EmailConnection;
}
