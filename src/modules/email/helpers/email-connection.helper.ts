import { ImapConnector } from '../connectors/imap.connector';
import { EmailConnection } from '../interfaces/email-connection.interface';

export class EmailConnectionHelper {
  public async checkConnection(
    connection: EmailConnection
  ): Promise<void> {
    try {
      const { config } = connection;
      var imapConnector = new ImapConnector(config);
      await imapConnector.connect();
      imapConnector.disconnect();
    } catch (error) {
      if (imapConnector !== undefined) {
        imapConnector.disconnect();
      }
      throw error;
    }
  };
}
