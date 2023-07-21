export function paginateSqlSelect(
  select: string,
  idColumn: string,
  offset: number,
  limit: number
) {
  let paginatedSelect = select.trim();

  const idPattern = /{{id}}/;
  const offsetPattern = /{{offset}}/;
  const limitPattern = /{{limit}}/;

  paginatedSelect = paginatedSelect.replace(idPattern, idColumn);
  paginatedSelect = paginatedSelect.replace(offsetPattern, offset.toString());
  paginatedSelect = paginatedSelect.replace(limitPattern, limit.toString());

  return paginatedSelect;
}

//   export function createCheckSqlSelectIdColumnUniquenessQuery(
//     dialect: string,
//     idColumn: string,
//     query: string
//   ) {
//     let paginatedQuery = paginateSqlSelect(query, idColumn, offset, limit);
//     if (dialect === 'Oracle' || dialect === 'Microsoft SQL Server') {
//       return `
//       SELECT CASE WHEN COUNT(${idColumn}) = COUNT(DISTINCT ${idColumn})
//         THEN 1 ELSE 0 END AS has_no_duplicates
//         FROM (${paginatedQuery}) custom_select;
//     `;
//     } else {
//       return `
//       SELECT COUNT(${idColumn}) = COUNT(DISTINCT ${idColumn}) AS has_no_duplicates
//         FROM (${paginatedQuery}) custom_select;
//     `;
//     }
//   }