import { SqlConnector } from '../connectors/sql.connector';
import { SqlConnection } from '../interfaces/sql.connection.interface';

export class SqlConnectionHelper {
  public async checkConnection(connection: SqlConnection): Promise<void> {
    let sqlConnector: SqlConnector;
    try {
      const { config } = connection;
      const sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();
      sqlConnector.disconnect();
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();
      throw error;
    }
  };
}
