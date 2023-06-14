export function createSelectColumnsQuery(table: string) {
  return `
      SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${table}';
    `;
}

export function createSelectDataQuery(
  table: string,
  requestedFields?: string[],
  limit?: number,
  offset?: number
) {
  let query = 'SELECT ';
  if (!requestedFields) {
    query += '*';
  } else {
    const fields = requestedFields.map((field) => `"${field}"`).join(', ');
    query += fields;
  }

  query += ` FROM ${table}`;

  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  if (offset) {
    query += ` OFFSET ${offset}`;
  }

  return query;
}

export function paginateQuery(query: string, limit: number, offset: number) {
  let paginatedQuery = query.trim();
  if (paginatedQuery.endsWith(';')) {
    paginatedQuery = paginatedQuery.slice(0, -1);
  }
  paginatedQuery += ` LIMIT ${limit}`;
  paginatedQuery += ` OFFSET ${offset}`;

  return paginatedQuery;
}

export function createSelectCountQuery(table: string) {
  return `SELECT COUNT(*) FROM ${table}`;
}
