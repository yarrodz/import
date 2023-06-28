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

  public async find(impt: Omit<IImport, 'fields'>): Promise<IColumn[]> {
    let columns: IColumn[] = [];
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
      case ImportSource.ORACLE:
        columns = await this.sqlColumnsService.find(impt);
        break;
      case ImportSource.API:
        columns = await this.apiColumnsService.find(impt);
        break;
      //   case ImportSource.IMAP:
      //     throw new Error('Not implemented');
      default:
        throw new Error(
          `Unexpected import source for receiving columns: ${impt.source}`
        );
    }
    return columns;
  }

  public async checkIdColumnUniqueness(
    impt: Omit<IImport, 'fields'>
  ): Promise<boolean> {
    let idColumnUnique: boolean;
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        idColumnUnique = await this.sqlColumnsService.checkIdColumnUniqueness(
          impt
        );
        break;
      case ImportSource.API:
        idColumnUnique = this.apiColumnsService.checkIdColumnUniqueness(impt);
        break;
      //   case ImportSource.IMAP:
      //     throw new Error('Not implemented');
      default:
        throw new Error(
          `Unexpected import source for receiving columns: ${impt.source}`
        );
    }
    return idColumnUnique;
  }
}

export default ColumnsService;
