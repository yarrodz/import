import { SqlConnection } from '../../../utils/sql/sql.connection';
import { SQLDialectMap } from '../../../utils/sql/sql.dialect-map';
import {
  createCheckSelectColumnUniquenessQuery,
  createCheckTableColumnUniquenessQuery,
  createSelectColumnsQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/sql/sql.query-builder';
import { IImport } from '../../imports/import.schema';
import { IColumn } from '../interfaces/column.interface';

class SQLColumnsService {
  public async find(impt: Omit<IImport, 'fields'>): Promise<IColumn[]> {
    let sqlConnection: SqlConnection;
    try {
      const { source, database } = impt;
      const { connection, idColumn, table, customSelect } = database;
      const dialect = SQLDialectMap[source];

      sqlConnection = new SqlConnection({
        ...connection,
        dialect
      });
      await sqlConnection.connect();

      let columns: IColumn[] = [];
      if (table) {
        try {
          columns = await this.selectColumnsFromSchema(
            sqlConnection,
            table,
            source
          );
          //Maybe user have no access to information schema then we receive columns from dataset
        } catch (error) {
          const query = createSelectDataQuery(source, table, idColumn, 0, 1);
          columns = await this.selectColumnsFromDataset(sqlConnection, query);
        }
      } else {
        const query = paginateQuery(source, customSelect, idColumn, 0, 1);
        columns = await this.selectColumnsFromDataset(sqlConnection, query);
      }
      sqlConnection.disconnect();
      return columns;
    } catch (error) {
      sqlConnection.disconnect();
      throw error;
    }
  }

  public async checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    let sqlConnection: SqlConnection;
    try {
      const { source, database } = impt;
      const { connection, idColumn, table, customSelect } = database;
      const dialect = SQLDialectMap[source];

      sqlConnection = new SqlConnection({
        ...connection,
        dialect
      });
      await sqlConnection.connect();

      let isUnique: boolean;
      if (table) {
        const query = createCheckTableColumnUniquenessQuery(
          source,
          idColumn,
          table
        );
        isUnique = await sqlConnection.queryResult(query);
      } else {
        const query = createCheckSelectColumnUniquenessQuery(
          source,
          idColumn,
          customSelect
        );
        isUnique = await sqlConnection.queryResult(query);
      }
      sqlConnection.disconnect();
      return isUnique;
    } catch (error) {
      sqlConnection.disconnect();
      throw error;
    }
  }

  private async selectColumnsFromSchema(
    sqlConnection: SqlConnection,
    table: string,
    dialect: string
  ): Promise<IColumn[]> {
    const columnsQuery = createSelectColumnsQuery(table, dialect);
    const retrievedColumns = await sqlConnection.queryRows(columnsQuery);
    return retrievedColumns.map((column) => {
      return {
        name: column['column_name'] || column['COLUMN_NAME'],
        type: column['data_type'] || column['DATA_TYPE']
      };
    });
  }

  private async selectColumnsFromDataset(
    sqlConnection: SqlConnection,
    query: string
  ): Promise<IColumn[]> {
    const retrievedDatasets = await sqlConnection.queryRows(query);
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

export default SQLColumnsService;
