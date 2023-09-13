import { ProcessType } from '../../processes/enums/process.type.enum';
import { Source } from '../../imports/enums/source.enum';
import { RetryOptions } from '../../imports/interfaces/retry-options.interace';
import { SqlExportTarget } from '../enums/sql-export-target.enum';
import { SqlConnection } from './sql.connection.interface';

export interface SqlExport {
  id: number;

  name: string;
  idKey: string;

  type: ProcessType.EXPORT;
  source: Source.SQL;

  limitRequestsPerSecond: number;
  retryOptions: RetryOptions;

  target: SqlExportTarget;
  table?: string;
  insert?: string;
  limit: number;

  connection?: SqlConnection;
}
