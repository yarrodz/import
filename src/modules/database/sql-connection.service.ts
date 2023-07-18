import { IImportDocument } from '../imports/import.schema';
import { SqlConnector } from './connector/sql.connection';
import { SQLDialectMap } from './connector/sql.dialect-map';
import { ConnectionState } from '../connection/enums/connection-state.enum';

class SqlConnectionSerice {
  public async connect(impt: IImportDocument): Promise<ConnectionState> {
    let sqlConnector: SqlConnector;
    try {
      const { source, database } = impt;
      const { connection } = database;
      const dialect = SQLDialectMap[source];

      sqlConnector = new SqlConnector({
        ...connection,
        dialect
      });
      await sqlConnector.connect();
      sqlConnector.disconnect();
      return ConnectionState.CONNECTED;
    } catch (error) {
      sqlConnector.disconnect();
      throw new Error(`Error while connecting to SQL: ${error.message}`);
    }
  }
}

export default SqlConnectionSerice;
