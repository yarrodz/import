import { EmailImportTarget } from '../enums/email-import-target.enum';
import { Column } from '../../transfers/interfaces/column.interface';
import { emailColumns } from '../constants/email-columns.constant';
import { converationColumns } from '../constants/converasation-columns.constant';

export class EmailColumnsHelper {
  get(target: EmailImportTarget): Column[] {
    const cases = {
      [EmailImportTarget.EMAILS]: emailColumns,
      [EmailImportTarget.CONVERSATIONS]: converationColumns
    }
    return cases[target];
  }
}
