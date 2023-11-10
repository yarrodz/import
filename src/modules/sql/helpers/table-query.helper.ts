import { OffsetPagination } from "../../transfer-processes/interfaces/offset-pagination.interface";

export class TableQueryHelper {
  static createColumnsQuery(table: string, dialect: string) {
    if (dialect === 'Oracle') {
      return `
        SELECT column_name, data_type
          FROM user_tab_columns
          WHERE table_name = '${table}';
      `;
    } else {
      return `
        SELECT column_name, data_type
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE table_name = '${table}';
      `;
    }
  }

  static createSelectQuery(
    table: string,
    idKey: string,
    pagination: OffsetPagination,
    requestedFields?: string[]
  ) {
    const { offset, limit } = pagination;

    let select = 'SELECT ';
  
    if (requestedFields) {
      select += requestedFields.join(', ');
    } else {
      select += '*';
    }
  
    return select +
      ` FROM ${table} WHERE ${idKey} >= ${offset} LIMIT ${limit} ORDER BY ${idKey}`;
  }

  static createCheckIdColumnUniquenessQuery(
    table: string,
    dialect: string,
    idKey: string,
  ) {
    if (dialect === 'Oracle' || dialect === 'Microsoft SQL Server') {
      return `
        SELECT CASE WHEN COUNT(${idKey}) = COUNT(DISTINCT ${idKey})
          THEN 1 ELSE 0 END AS is_unique
          FROM ${table};
      `;
    }
    return `
      SELECT COUNT(${idKey}) = COUNT(DISTINCT ${idKey}) AS is_unique
        FROM ${table};
    `;
  }
  
  static createCountQuery(table: string) {
    return `SELECT COUNT(*) FROM ${table}`;
  }

  static createMinIdQuery(table: string, idKey: string) {
    return `SELECT ${idKey} FROM ${table} OFFSET 0 LIMIT 1 ORDER BY ${idKey} ASC`;
  }

  static createMaxIdQuery(table: string, idKey: string) {
    return `SELECT ${idKey} FROM ${table} OFFSET 0 LIMIT 1 ORDER BY ${idKey} DESC`;
  }
}