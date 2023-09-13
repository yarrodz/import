import { TransferState } from '../enums/transfer-state.enum';
import { TransferMethod } from '../enums/transfer-method.enum';
import { TransferReference } from './transfer-reference.interface';

export interface Transfer {
  id: number;

  method: TransferMethod;
  state: TransferState;

  offset: number;
  cursor?: string;

  references?: any[];

  total?: number;
  transfered: number;

  log?: string[];

  retryAttempts: number;

  __: TransferReference;
}
