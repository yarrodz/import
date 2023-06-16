export function createSelectColumnsQuery(table: string) {
  return `
    SELECT column_name, data_type
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = '${table}';
  `;
}

export function createSelectDataQuery(
  dialect: string,
  table: string,
  idColumn: string,
  requestedFields: string[],
  offset: number,
  limit: number
) {
  let query = 'SELECT ';

  const fields = requestedFields.map((field) => `${field}`).join(', ');
  query += fields;

  if (dialect !== 'Microsoft SQL Server') {
    query += ` FROM ${table} ORDER BY ${idColumn} LIMIT ${limit} OFFSET ${offset}`;
  } else {
    query +=
      ` FROM ${table} ORDER BY ${idColumn} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
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

  if (dialect !== 'Microsoft SQL Server') {
    paginatedQuery += ` LIMIT ${limit} OFFSET ${offset}`;
  } else {
    paginatedQuery +=
      ` ORDER BY ${idColumn} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  }

  return paginatedQuery;
}

export function createSelectCountQuery(table: string) {
  return `SELECT COUNT(*) FROM ${table}`;
}
