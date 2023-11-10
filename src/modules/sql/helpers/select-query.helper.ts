import { OffsetPagination } from "../../transfer-processes/interfaces/offset-pagination.interface";

export class SelectQueryHelper {
  static paginateSelect(
    select: string,
    idKey: string,
    pagination: OffsetPagination,
  ) {
    const { offset, limit } = pagination;

    return select.trim() + 
      ` WHERE ${idKey} >= ${offset} LIMIT ${limit} ORDER BY ${idKey} ASC`;
  }

  static createCheckIdColumnUniquenessQuery(
    select: string,
    dialect: string,
    idKey: string,
  ) {
    if (dialect === 'Oracle' || dialect === 'Microsoft SQL Server') {
      return `
        SELECT CASE WHEN COUNT(${idKey}) = COUNT(DISTINCT ${idKey})
          THEN 1 ELSE 0 END AS is_unique
          FROM (${select}) provided_select;
      `;
    }
    return `
      SELECT COUNT(${idKey}) = COUNT(DISTINCT ${idKey}) AS is_unique
        FROM (${select}) provided_select;
    `;
  }

  static createCountQuery(table: string) {
    return `SELECT COUNT(*) FROM ${table}`;
  }

  static createMinIdQuery(select: string, idKey: string) {
    return select.trim() + ` OFFSET 0 LIMIT 1 ORDER BY ${idKey} ASC`;
  }

  static createMaxIdQuery(select: string, idKey: string) {
    return select.trim() + ` OFFSET 0 LIMIT 1 ORDER BY ${idKey} DESC`;
  }
}