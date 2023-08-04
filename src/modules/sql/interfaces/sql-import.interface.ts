import ImportField from '../../synchronizations/interfaces/import-field.interface';
import { SqlImportTarget } from '../enums/sql-import-target.enum';

export default interface SqlImport {
  id: string;
  target: SqlImportTarget;
  table?: string;
  select?: string;
  limit: number;
  fields: ImportField[];
}
