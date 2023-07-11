export function createCheckTableColumnUniquenessQuery(
  dialect: string,
  column: string,
  table: string
) {
  if (dialect === 'Oracle' || dialect === 'Microsoft SQL Server') {
    return `
    SELECT CASE WHEN COUNT(${column}) = COUNT(DISTINCT ${column})
      THEN 1 ELSE 0 END AS has_no_duplicates
      FROM ${table};
  `;
  } else {
    return `
    SELECT COUNT(${column}) = COUNT(DISTINCT ${column}) AS has_no_duplicates
      FROM ${table};
  `;
  }
}

export function createCheckSelectColumnUniquenessQuery(
  dialect: string,
  column: string,
  query: string
) {
  if (query.endsWith(';')) {
    query = query.slice(0, -1);
  }
  if (dialect === 'Oracle' || dialect === 'Microsoft SQL Server') {
    return `
    SELECT CASE WHEN COUNT(${column}) = COUNT(DISTINCT ${column})
      THEN 1 ELSE 0 END AS has_no_duplicates
      FROM (${query}) custom_select;
  `;
  } else {
    return `
    SELECT COUNT(${column}) = COUNT(DISTINCT ${column}) AS has_no_duplicates
      FROM (${query}) custom_select;
  `;
  }
}

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
