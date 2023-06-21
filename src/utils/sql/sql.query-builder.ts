export function createSelectColumnsQuery(table: string, dialect: string) {
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

export function createSelectDataQuery(
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

export function paginateQuery(
  dialect: string,
  query: string,
  idColumn: string,
  offset: number,
  limit: number
) {
  let paginatedQuery = query.trim();
  if (paginatedQuery.endsWith(';')) {
    paginatedQuery = paginatedQuery.slice(0, -1);
  }

  if (dialect === 'Microsoft SQL Server' || dialect === 'Oracle') {
    paginatedQuery += ` ORDER BY ${idColumn} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  } else {
    paginatedQuery += ` ORDER BY ${idColumn} LIMIT ${limit} OFFSET ${offset}`;
  }

  return paginatedQuery;
}

export function createSelectCountQuery(table: string) {
  return `SELECT COUNT(*) FROM ${table}`;
}
