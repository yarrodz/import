export function createCheckSqlTableIdColumnUniquenessQuery(
  dialect: string,
  idColumn: string,
  table: string
) {
  if (dialect === 'Oracle' || dialect === 'Microsoft SQL Server') {
    return `
      SELECT CASE WHEN COUNT(${idColumn}) = COUNT(DISTINCT ${idColumn})
        THEN 1 ELSE 0 END AS has_no_duplicates
        FROM ${table};
    `;
  } else {
    return `
      SELECT COUNT(${idColumn}) = COUNT(DISTINCT ${idColumn}) AS has_no_duplicates
        FROM ${table};
    `;
  }
}

export function createSqlTableFindColumnsQuery(table: string, dialect: string) {
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

export function createSqlTableFindDataQuery(
  dialect: string,
  table: string,
  idColumn: string,
  offset: number,
  limit: number,
  requestedFields?: string[]
) {
  let query = 'SELECT ';

  if (requestedFields) {
    const fields = requestedFields.map((field) => `${field}`).join(', ');
    query += fields;
  } else {
    query += '*';
  }

  if (dialect === 'Microsoft SQL Server' || dialect === 'Oracle') {
    query += ` FROM ${table} ORDER BY ${idColumn} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  } else {
    query += ` FROM ${table} ORDER BY ${idColumn} LIMIT ${limit} OFFSET ${offset}`;
  }

  return query;
}

export function createSqlTableCountQuery(table: string) {
  return `SELECT COUNT(*) FROM ${table}`;
}
