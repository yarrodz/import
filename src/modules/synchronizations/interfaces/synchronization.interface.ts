import { SynchronizationSource } from '../enums/synchronization-source.enum';
import ApiConnection from '../../api/interfaces/api-connection.interface';
import ApiExport from '../../api/interfaces/api-export.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import SqlExport from '../../sql/interfaces/sql-export.interface';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import SqlConnection from '../../sql/interfaces/sql.connection.interface';
import RetryOptions from './retry-options.interace';

export default interface Synchronization {
  id: number;
  unit: any;
  name: string;
  source: SynchronizationSource;
  totalDatasetsCount?: number;
  idParameterName: string;
  limitRequestsPerSecond: number;
  retryOptions: RetryOptions;
  connection?: SqlConnection | ApiConnection;
  import?: SqlImport | ApiImport;
  export?: SqlExport | ApiExport;
}
