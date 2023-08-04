import { SqlConnector } from '../connector/sql.connector';
import { SqlSequelizeDialectMap } from '../connector/sql-sequelize-dialect.map';
import { Dialect as SequelizeDialect } from 'sequelize';
import { SqlImportTarget } from '../enums/sql-import-target.enum';
import {
  createCheckSqlTableIdColumnUniquenessQuery,
  createSqlTableFindColumnsQuery,
  createSqlTableFindDataQuery
} from '../connector/sql-table.query-builder';
import { paginateSqlSelect } from '../connector/sql-select.query-builder';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Column from '../../columns/column.interface';
import SqlImport from '../interfaces/sql-import.interface';
import SqlConnection from '../interfaces/sql.connection.interface';

class SqlColumnsHelper {
  public async find(synchronization: Synchronization): Promise<Column[]> {
    let sqlConnector: SqlConnector;
    try {
      const impt = synchronization.import as SqlImport;
      const connection = synchronization.connection as SqlConnection;
      const { idParameterName } = synchronization;
      const { target, table, select } = impt;
      const { dialect } = connection;

      const sequelizeDialect = SqlSequelizeDialectMap[
        dialect
      ] as SequelizeDialect;
      sqlConnector = new SqlConnector({
        ...connection,
        dialect: sequelizeDialect
      });
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
              idParameterName,
              0,
              1
            );
            columns = await this.selectColumnsFromDataset(sqlConnector, query);
          }
          break;
        }
        case SqlImportTarget.SELECT: {
          const query = paginateSqlSelect(select, idParameterName, 0, 1);
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
      sqlConnector.disconnect();
      throw error;
    }
  }

  public async checkIdColumnUniqueness(synchronization: Synchronization) {
    let sqlConnector: SqlConnector;
    try {
      const impt = synchronization.import as SqlImport;
      const connection = synchronization.connection as SqlConnection;
      const { idParameterName } = synchronization;
      const { target, table } = impt;
      const { dialect } = connection;

      const sequelizeDialect = SqlSequelizeDialectMap[
        dialect
      ] as SequelizeDialect;
      sqlConnector = new SqlConnector({
        ...connection,
        dialect: sequelizeDialect
      });
      await sqlConnector.connect();

      let isUnique: boolean;
      switch (target) {
        case SqlImportTarget.TABLE: {
          const query = createCheckSqlTableIdColumnUniquenessQuery(
            dialect,
            idParameterName,
            table
          );
          isUnique = await sqlConnector.queryResult(query);
          break;
        }
        case SqlImportTarget.SELECT: {
          // const query = createCheckSelectColumnUniquenessQuery(
          //   source,
          //   idColumn,
          //   select
          // );
          // isUnique = await sqlConnector.queryResult(query);
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
      sqlConnector.disconnect();
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

export default SqlColumnsHelper;
