import { TransferStatus } from '../enums/transfer-status.enum';
import { TransferProcessReference } from './transfer-process-reference.interface';

export interface TransferProcess {
  id: number;

  status: TransferStatus;

  offset: number;
  cursor?: string;
  transfered: number;
  total?: number;

  helper?: any;

  lastLog?: string;
  logs?: string[];

  retryAttempts: number;
  retryDate?: Date;
  maxRetryAttempts: number;
  retryTimeDelay: number;

  __: TransferProcessReference;
}
