import { SqlConnection } from '../../../utils/sql/sql.connection';
import { SQLDialectMap } from '../../../utils/sql/sql.dialect-map';
import {
  createCheckSelectColumnUniquenessQuery,
  createCheckTableColumnUniquenessQuery,
  createSelectColumnsQuery,
  createSelectDataQuery,
  paginateQuery
} from '../../../utils/sql/sql.query-builder';
import { DatabaseImportTarget } from '../../imports/enums/database-import-target.enum';
import { IImport } from '../../imports/import.schema';
import { IColumn } from '../interfaces/column.interface';

class SQLColumnsService {
  public async find(impt: Omit<IImport, 'fields'>): Promise<IColumn[]> {
    let sqlConnection: SqlConnection;
    try {
      const { source, database } = impt;
      const { connection, idColumn, table, customSelect, target } = database;
      const dialect = SQLDialectMap[source];

      sqlConnection = new SqlConnection({
        ...connection,
        dialect
      });
      await sqlConnection.connect();

      let columns: IColumn[] = [];
      switch (target) {
        case DatabaseImportTarget.TABLE:
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
          break;
        case DatabaseImportTarget.CUSTOM_SELECT:
          const query = paginateQuery(source, customSelect, idColumn, 0, 1);
          columns = await this.selectColumnsFromDataset(sqlConnection, query);
          break;
        default:
          throw new Error('Unexpected database import target');
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
      const { connection, idColumn, table, customSelect, target } = database;
      const dialect = SQLDialectMap[source];

      sqlConnection = new SqlConnection({
        ...connection,
        dialect
      });
      await sqlConnection.connect();

      let isUnique: boolean;
      switch (target) {
        case DatabaseImportTarget.TABLE:
          const tableQuery = createCheckTableColumnUniquenessQuery(
            source,
            idColumn,
            table
          );
          isUnique = await sqlConnection.queryResult(tableQuery);
          break;
        case DatabaseImportTarget.CUSTOM_SELECT:
          const customSelectQuery = createCheckSelectColumnUniquenessQuery(
            source,
            idColumn,
            customSelect
          );
          isUnique = await sqlConnection.queryResult(customSelectQuery);
          break;
        default:
          throw new Error('Unexpected database import target');
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
