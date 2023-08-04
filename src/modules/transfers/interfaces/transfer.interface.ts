import { TransferStatus } from '../enums/transfer-status.enum';
import { TransferMethod } from '../enums/transfer-method.enum';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';

export default interface Transfer {
  id: number;
  unit: any;
  synchronization: Synchronization;
  type: TransferType;
  method: TransferMethod;
  status: TransferStatus;
  cursor?: string;
  totalDatasetsCount?: number;
  processedDatasetsCount: number;
  transferedDatasetsCount: number;
  log: string[];
  retryAttempts: number;
  errorMessage?: string;
}
