import SQLColumnsService from './columns/sql-columns.service';
import { IImport } from '../imports/import.schema';
import { IColumn } from './interfaces/column.interface';
import { ImportSource } from '../imports/enums/import-source.enum';
import APIColumnsService from './columns/api-columns.service';

class ColumnsService {
  private sqlColumnsService: SQLColumnsService;
  private apiColumnsService: APIColumnsService;

  constructor(
    sqlColumnsService: SQLColumnsService,
    apiColumnsService: APIColumnsService
  ) {
    this.sqlColumnsService = sqlColumnsService;
    this.apiColumnsService = apiColumnsService;
  }

  public async find(
    impt: Omit<IImport, 'fields'>,
    token?: string 
  ): Promise<IColumn[] | string> {
    let columns: IColumn[] = [];
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        return await this.sqlColumnsService.find(impt);
      case ImportSource.API:
        return await this.apiColumnsService.find(impt, token);
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
