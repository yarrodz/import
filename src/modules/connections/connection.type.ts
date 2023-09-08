import { ApiConnection } from '../api/interfaces/api-connection.interface';
import { EmailConnection } from '../email/interfaces/email-connection.interface';
import { SqlConnection } from '../sql/interfaces/sql.connection.interface';

export type Connection = SqlConnection | ApiConnection | EmailConnection;
