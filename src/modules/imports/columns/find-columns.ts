import { ImportSource } from '../enums/import-source.enum';
import { IImport } from '../import.schema';
import { IColumn } from '../intefaces/column.interface';
import { receiveApiColumns } from './api.columns';
import { receiveSqlTableColumns } from './sql.columns';

export default async function findColumns(impt: Omit<IImport, 'fields'>) {
  try {
    let columns: IColumn[] = [];
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.SQLITE:
      case ImportSource.MARIADB:
      case ImportSource.ORACLE:
        columns = await receiveSqlTableColumns(impt);
        break;
      case ImportSource.API:
        columns = await receiveApiColumns(impt);
        break;
      case ImportSource.IMAP:
        throw new Error('Not implemented imap columns');
      default:
        throw new Error(
          `Unexpected import source for receiving columns: ${impt.source}`
        );
    }
    return columns;
  } catch (error) {
    throw new Error(`Error while receiving columns: ${error.message}`);
  }
}
