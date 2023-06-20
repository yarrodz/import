import { ImportSource } from '../modules/imports/enums/import-source.enum';
import { IImport } from '../modules/imports/import.schema';
import { IColumn } from '../modules/imports/intefaces/column.interface';
import { receiveApiColumns } from './api.columns';
import { findSqlTableColumns } from './sql.columns';

export default async function findColumns(
  impt: Omit<IImport, 'fields'>
): Promise<IColumn[]> {
  try {
    return await find(impt);
  } catch (error) {
    throw new Error(`Error while receiving columns: ${error.message}`);
  }
}

async function find(impt: Omit<IImport, 'fields'>): Promise<IColumn[]> {
  let columns: IColumn[] = [];
  switch (impt.source) {
    case ImportSource.MYSQL:
    case ImportSource.POSTGRESQL:
    case ImportSource.MICROSOFT_SQL_SERVER:
    case ImportSource.ORACLE:
    case ImportSource.MARIADB:
    case ImportSource.ORACLE:
      columns = await findSqlTableColumns(impt);
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
}
