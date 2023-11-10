import { SqlConnector } from '../connectors/sql.connector';
import { SqlImportTarget } from '../enums/sql-import-target.enum';
import { Column } from '../../transfers/interfaces/column.interface';
import { SqlConnection } from '../interfaces/sql.connection.interface';
import { SelectQueryHelper } from './select-query.helper';
import { TableQueryHelper } from './table-query.helper';
import { SqlIframeTransfer } from '../interfaces/sql-iframe-transfer.interface';
import { OffsetPagination } from '../../transfer-processes/interfaces/offset-pagination.interface';

export class SqlColumnsHelper {
  public async get(transfer: SqlIframeTransfer): Promise<Column[]> {
    let sqlConnector: SqlConnector;
    try {
      const { target } = transfer;
      const connection = transfer.__.connection as SqlConnection;
      const { config } = connection;

      sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      const cases = {
        [SqlImportTarget.TABLE]: this.tableColumns,
        [SqlImportTarget.SELECT]: this.selectColumns
      }

      const columns: Column[] = await cases[target](transfer, sqlConnector);
      sqlConnector.disconnect();
      return columns;
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();
      throw error;
    }
  }

  private async tableColumns(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ): Promise<Column[]> {
    const { idKey, table } = transfer;
    const connection = transfer.__.connection as SqlConnection;
    const { config } = connection;
    const { dialect } = config;
    
    try {
      return await this.selectColumnsFromSchema(
        sqlConnector,
        table,
        dialect
      );
      //Maybe user have no access to information schema, then we receive columns from dataset
    } catch (error) {
      const pagination: OffsetPagination = { offset: 0, limit: 1 };
      const query = TableQueryHelper.createSelectQuery(
        table,
        idKey,
        pagination
      );
      return await this.selectColumnsFromQuery(
        sqlConnector,
        query
      );
    }
  }

  private async selectColumns(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ): Promise<Column[]> {
    const { idKey, select } = transfer;
    const pagination: OffsetPagination = { offset: 0, limit: 1 };
    const query = SelectQueryHelper.paginateSelect(
      select,
      idKey,
      pagination
    );
    return await this.selectColumnsFromQuery(sqlConnector, query);
  }

  private async selectColumnsFromSchema(
    sqlConnector: SqlConnector,
    table: string,
    dialect: string
  ): Promise<Column[]> {
    const columnsQuery = TableQueryHelper.createColumnsQuery(
      table,
      dialect
    );
    const columns = await sqlConnector.queryRows(columnsQuery);
    
    return columns.map((column) => {
      return {
        name: column['column_name'] || column['COLUMN_NAME'],
        type: column['data_type'] || column['DATA_TYPE']
      };
    });
  }

  private async selectColumnsFromQuery(
    sqlConnector: SqlConnector,
    query: string
  ): Promise<Column[]> {
    const datasets = await sqlConnector.queryRows(query);

    if (datasets.length === 0) {
      throw new Error('Error while quering columns: table is empty');
    }

    const dataset = datasets[0];
    return Object.entries(dataset).map(([key, value]) => {
      return {
        name: key,
        type: typeof value
      };
    });
  }

  public async checkIdColumnUniqueness(transfer: SqlIframeTransfer) {
    let sqlConnector: SqlConnector;
    try {
      const { target } = transfer;
      const connection = transfer.__.connection as SqlConnection;
      const { config } = connection;

      sqlConnector = new SqlConnector(config);
      await sqlConnector.connect();

      const cases = {
        [SqlImportTarget.TABLE]: this.tableIdColumnUniqueness,
        [SqlImportTarget.SELECT]: this.selectIdColumnUniqueness
      } 

      const isUnique = await cases[target](transfer, sqlConnector);
      sqlConnector.disconnect();
      return isUnique;
    } catch (error) {
      sqlConnector && sqlConnector.disconnect();
      throw new Error(
        `Error while checking column uniqueness: ${error.message}`
      );
    }
  }

  private async tableIdColumnUniqueness(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ) {
    const { idKey, table } = transfer;
    const connection = transfer.__.connection as SqlConnection;
    const { config } = connection;
    const { dialect } = config;

    const query = SelectQueryHelper.createCheckIdColumnUniquenessQuery(
      table,
      dialect,
      idKey,
    );

    return await sqlConnector.queryResult(query);
  }

  private async selectIdColumnUniqueness(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ) {
    const { select, idKey } = transfer;
    const connection = transfer.__.connection as SqlConnection;
    const { config } = connection;
    const { dialect } = config

    const query = TableQueryHelper.createCheckIdColumnUniquenessQuery(
      select,
      dialect,
      idKey,
    );

    return await sqlConnector.queryResult(query);
  }
}
