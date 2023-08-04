import { SqlExportTarget } from '../enums/sql-export-target.enum';

export default interface SqlExport {
  target: SqlExportTarget;
  table?: string;
  insert?: string;
  limit: number;
}
