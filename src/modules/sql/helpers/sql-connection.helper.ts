import { SqlConnector } from '../connector/sql.connector';
import SqlConnection from '../interfaces/sql.connection.interface';

class SqlConnectionHelper {
  public checkConnection = async (connection: SqlConnection): Promise<void> => {
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

export default SqlConnectionHelper;
