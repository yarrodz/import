import { SqlConnector } from '../connector/sql.connector';
import { SqlImportTarget } from '../enums/sql-import-target.enum';
import {
  createCheckSqlTableIdColumnUniquenessQuery,
  createSqlTableFindColumnsQuery,
  createSqlTableFindDataQuery
} from '../connector/sql-table.query-builder';
import { paginateSqlSelect } from '../connector/sql-select.query-builder';
import { Column } from '../../imports/interfaces/column.interface';
import { SqlImport } from '../interfaces/sql-import.interface';
import { SqlConnection } from '../interfaces/sql.connection.interface';

export class SqlColumnsHelper {
  public async find(impt: SqlImport): Promise<Column[]> {
    let sqlConnector: SqlConnector;
    try {
      const { idKey, target, table, select } = impt;
      const connection = impt.__.hasConnection as SqlConnection;
      const { config } = connection;
      const { dialect } = config;

      sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      let columns: Column[] = [];

      switch (target) {
        case SqlImportTarget.TABLE: {
          try {
            columns = await this.selectColumnsFromSchema(
              sqlConnector,
              table,
              dialect
            );
            //Maybe user have no access to information schema, then we receive columns from dataset
          } catch (error) {
            const query = createSqlTableFindDataQuery(
              dialect,
              table,
              idKey,
              0,
              1
            );
            columns = await this.selectColumnsFromDataset(sqlConnector, query);
          }
          break;
        }
        case SqlImportTarget.SELECT: {
          const query = paginateSqlSelect(select, idKey, 0, 1);
          columns = await this.selectColumnsFromDataset(sqlConnector, query);
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}`);
        }
      }
      sqlConnector.disconnect();
      return columns;
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();
      throw error;
    }
  }

  public async checkIdColumnUniqueness(impt: SqlImport) {
    let sqlConnector: SqlConnector;
    try {
      const { idKey, target, table } = impt;
      const connection = impt.__.hasConnection as SqlConnection;
      const { config } = connection;
      const { dialect } = config;

      sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      let isUnique: boolean;
      switch (target) {
        case SqlImportTarget.TABLE: {
          const query = createCheckSqlTableIdColumnUniquenessQuery(
            dialect,
            idKey,
            table
          );
          isUnique = await sqlConnector.queryResult(query);
          break;
        }
        case SqlImportTarget.SELECT: {
          isUnique = true;
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}`);
        }
      }
      sqlConnector.disconnect();
      return isUnique;
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();
      throw new Error(
        `Error while checking column uniqueness: ${error.message}`
      );
    }
  }

  private async selectColumnsFromSchema(
    sqlConnector: SqlConnector,
    table: string,
    dialect: string
  ): Promise<Column[]> {
    const columnsQuery = createSqlTableFindColumnsQuery(table, dialect);
    const retrievedColumns = await sqlConnector.queryRows(columnsQuery);
    return retrievedColumns.map((column) => {
      return {
        name: column['column_name'] || column['COLUMN_NAME'],
        type: column['data_type'] || column['DATA_TYPE']
      };
    });
  }

  private async selectColumnsFromDataset(
    sqlConnector: SqlConnector,
    query: string
  ): Promise<Column[]> {
    const retrievedDatasets = await sqlConnector.queryRows(query);
    if (retrievedDatasets.length === 0) {
      throw new Error('Error while quering columns: table is empty');
    }
    const dataset = retrievedDatasets[0];
    return Object.entries(dataset).map(([key, value]) => {
      return {
        name: key,
        type: typeof value
      };
    });
  }
}
