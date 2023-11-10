import { Transfer } from '../../transfers/interfaces/transfer.interface';
import { SqlExportTarget } from '../enums/sql-export-target.enum';

export interface IframeSqlTransfer extends Transfer {
  idKey: string;

  limitRequestsPerSecond: number;
  limitDatasetsPerSecond: number;

  target: SqlExportTarget;
  table?: string;
  insert?: string;
}
