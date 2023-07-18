import { SqlConnector } from './connector/sql.connection';
import { SQLDialectMap } from './connector/sql.dialect-map';
import {
  createCheckSelectColumnUniquenessQuery,
  createCheckTableColumnUniquenessQuery,
  createSelectColumnsQuery,
  createSelectDataQuery,
  paginateQuery
} from './connector/sql.query-builder';
import { IImport, IImportDocument } from '../imports/import.schema';
import { IColumn } from '../columns/interfaces/column.interface';

class SqlColumnsService {
  public async find(impt: IImportDocument): Promise<IColumn[]> {
    let sqlConnector: SqlConnector;
    try {
      const { source, database, idColumn } = impt;
      const { connection, table, customSelect } = database;
      const dialect = SQLDialectMap[source];

      sqlConnector = new SqlConnector({
        ...connection,
        dialect
      });
      await sqlConnector.connect();

      let columns: IColumn[] = [];
      if (table) {
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
      } else {
        const query = paginateQuery(source, customSelect, idColumn, 0, 1);
        columns = await this.selectColumnsFromDataset(sqlConnector, query);
      }
      sqlConnector.disconnect();
      return columns;
    } catch (error) {
      sqlConnector.disconnect();
      throw error;
    }
  }

  public async checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    let sqlConnector: SqlConnector;
    try {
      const { source, database, idColumn } = impt;
      const { connection, table, customSelect } = database;
      const dialect = SQLDialectMap[source];

      sqlConnector = new SqlConnector({
        ...connection,
        dialect
      });
      await sqlConnector.connect();

      let isUnique: boolean;
      if (table) {
        const query = createCheckTableColumnUniquenessQuery(
          source,
          idColumn,
          table
        );
        isUnique = await sqlConnector.queryResult(query);
      } else {
        const query = createCheckSelectColumnUniquenessQuery(
          source,
          idColumn,
          customSelect
        );
        isUnique = await sqlConnector.queryResult(query);
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

export default SqlColumnsService;
