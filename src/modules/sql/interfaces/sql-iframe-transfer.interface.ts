import { SqlImportTarget } from '../enums/sql-import-target.enum';
import { Transfer } from '../../transfers/interfaces/transfer.interface';

export interface SqlIframeTransfer extends Transfer {
  idKey: string;

  target: SqlImportTarget;
  table?: string;
  select?: string;
  
  limitRequestsPerSecond: number;
  limitDatasetsPerRequest: number;
}
