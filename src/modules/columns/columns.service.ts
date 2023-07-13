import SqlColumnsService from '../database/sql-columns.service';
import { IImport } from '../imports/import.schema';
import { IColumn } from './interfaces/column.interface';
import { ImportSource } from '../imports/enums/import-source.enum';
import ApiColumnsService from '../api/api-columns.service';

class ColumnsService {
  private sqlColumnsService: SqlColumnsService;
  private apiColumnsService: ApiColumnsService;

  constructor(
    sqlColumnsService: SqlColumnsService,
    apiColumnsService: ApiColumnsService
  ) {
    this.sqlColumnsService = sqlColumnsService;
    this.apiColumnsService = apiColumnsService;
  }

  public async find(
    impt: Omit<IImport, 'fields'>
  ): Promise<IColumn[] | string> {
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        return await this.sqlColumnsService.find(impt);
      case ImportSource.API:
        return await this.apiColumnsService.find(impt);
      default:
        throw new Error(
          `Unexpected import source for receiving columns: ${impt.source}`
        );
    }
  }

  public async checkIdColumnUniqueness(
    impt: Omit<IImport, 'fields'>
  ): Promise<boolean> {
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        return await this.sqlColumnsService.checkIdColumnUniqueness(impt);
      case ImportSource.API:
        return this.apiColumnsService.checkIdColumnUniqueness(impt);
      default:
        throw new Error(
          `Error while receiving columns. Unexpected import source: ${impt.source}`
        );
    }
  }
}

export default ColumnsService;
