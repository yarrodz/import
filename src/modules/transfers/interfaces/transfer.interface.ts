import { TransferStatus } from '../enums/transfer-status.enum';
import { TransferMethod } from '../enums/transfer-method.enum';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import TransferReference from './transfer-reference.interface';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import SqlExport from '../../sql/interfaces/sql-export.interface';
import ApiExport from '../../api/interfaces/api-export.interface';

export default interface Transfer {
  id?: number;

  type: TransferType;
  method: TransferMethod;
  status: TransferStatus;

  offset: number;
  cursor?: string;

  datasetsCount?: number;
  transferedDatasetsCount: number;

  log: string[];
  retryAttempts: number;

  __?: TransferReference;

  import?: SqlImport | ApiImport;
  export?: SqlExport | ApiExport;

  unit?: any;
  project?: any;
}
