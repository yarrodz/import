import FindSQLColumnsService from './columns/sql-columns.service';
import { IImport } from '../imports/import.schema';
import { IColumn } from './interfaces/column.interface';
import { ImportSource } from '../imports/enums/import-source.enum';

class ColumnsService {
  private findSQLColumnsService: FindSQLColumnsService;

  constructor(findSQLColumnsService: FindSQLColumnsService) {
    this.findSQLColumnsService = findSQLColumnsService;
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
        columns = await this.findSQLColumnsService.find(impt);
        break;
      //   case ImportSource.API:
      //     columns = await receiveApiColumns(impt);
      //     break;
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
      case ImportSource.ORACLE:
        idColumnUnique =
          await this.findSQLColumnsService.checkIdColumnUniqueness(impt);
        break;
      //   case ImportSource.API:
      //     columns = await receiveApiColumns(impt);
      //     break;
      //   case ImportSource.IMAP:
      //     throw new Error('Not implemented');
      default:
        throw new Error(
          `Unexpected import source for receiving columns: ${impt.source}`
        );
    }
    return idColumnUnique;
  }

  // private async receiveApiColumns(
  //     impt: Omit<IImport, 'fields'>
  //   ): Promise<IColumn[]> {
  //     const requestConfig = impt.api.requestConfig;
  //     const path = impt.api.path;

  //     const data = await axios(requestConfig);
  //     const dataset = resolvePath(data, path)[0] as object;

  //     const columns: IColumn[] = Object.entries(dataset).map(([key, value]) => {
  //       return {
  //         name: key,
  //         type: typeof value
  //       };
  //     });
  //     return columns;
  //   }
}

export default ColumnsService;
