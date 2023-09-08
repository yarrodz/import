import { ImapConnector } from '../connector/imap.connector';
import { EmailConnection } from '../interfaces/email-connection.interface';

export class EmailConnectionHelper {
  public checkConnection = async (
    connection: EmailConnection
  ): Promise<void> => {
    let imapConnector: ImapConnector;
    try {
      const { config } = connection;
      const imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      imapConnector.disconnect();
    } catch (error) {
      imapConnector && imapConnector.disconnect();
      throw error;
    }
  };
}
