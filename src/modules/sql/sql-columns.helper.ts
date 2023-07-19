import { SqlConnector } from './connector/sql.connector';
import {
  createCheckSelectColumnUniquenessQuery,
  createCheckTableColumnUniquenessQuery,
  createSelectColumnsQuery,
  createSelectDataQuery,
  paginateQuery
} from './connector/sql.query-builder';
import { IImport, IImportDocument } from '../imports/import.schema';
import { IColumn } from '../columns/column.interface';
import { SqlSequelizeDialectMap } from './connector/sql-sequelize-dialect.map';
import { Dialect as SequelizeDialect } from 'sequelize';
import { SqlImportTarget } from './enums/sql-import-target.enum';

class SqlColumnsHelper {
  public async find(impt: IImportDocument): Promise<IColumn[]> {
    let sqlConnector: SqlConnector;
    try {
      const { source, sql, idColumn } = impt;
      const { connection, target, table, select, dialect } = sql;
      const sequelizeDialect = SqlSequelizeDialectMap[
        dialect
      ] as SequelizeDialect;

      console.log({
        ...connection,
        dialect: sequelizeDialect
      })
      sqlConnector = new SqlConnector({
        ...JSON.parse(JSON.stringify(connection)),
        dialect: sequelizeDialect
      });
      await sqlConnector.connect();

      let columns: IColumn[] = [];

      switch (target) {
        case SqlImportTarget.TABLE: {
          try {
            columns = await this.selectColumnsFromSchema(
              sqlConnector,
              table,
              source
            );
            //Maybe user have no access to information schema then we receive columns from dataset
          } catch (error) {
            const query = createSelectDataQuery(source, table, idColumn, 0, 1);
            columns = await this.selectColumnsFromDataset(sqlConnector, query);
          }
          break;
        }
        case SqlImportTarget.SELECT: {
          const query = paginateQuery(source, select, idColumn, 0, 1);
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
      console.error(error);
      sqlConnector.disconnect();
      throw error;
    }
  }

  public async checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    let sqlConnector: SqlConnector;
    try {
      const { source, sql, idColumn } = impt;
      const { connection, target, table, select, dialect } = sql;
      const sequelizeDialect = SqlSequelizeDialectMap[
        dialect
      ] as SequelizeDialect;

      sqlConnector = new SqlConnector({
        ...JSON.parse(JSON.stringify(connection)),
        dialect: sequelizeDialect
      });
      await sqlConnector.connect();

      let isUnique: boolean;
      switch (target) {
        case SqlImportTarget.TABLE: {
          const query = createCheckTableColumnUniquenessQuery(
            source,
            idColumn,
            table
          );
          isUnique = await sqlConnector.queryResult(query);
          break;
        }
        case SqlImportTarget.SELECT: {
          const query = createCheckSelectColumnUniquenessQuery(
            source,
            idColumn,
            select
          );
          isUnique = await sqlConnector.queryResult(query);
          break;
        }
        default: {
          throw new Error(`Unknown sql import target: ${target}`);
        }
      }
      sqlConnector.disconnect();
      return isUnique;
    } catch (error) {
      console.error(error);
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
  ): Promise<IColumn[]> {
    const columnsQuery = createSelectColumnsQuery(table, dialect);
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
  ): Promise<IColumn[]> {
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
