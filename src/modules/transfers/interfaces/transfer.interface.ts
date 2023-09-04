import { TransferStatus } from '../enums/transfer-status.enum';
import { TransferMethod } from '../enums/transfer-method.enum';
import { TransferType } from '../../transfers/enums/transfer-type.enum';
import TransferReference from './transfer-reference.interface';

export default interface Transfer {
  id: number;

  type: TransferType;
  method: TransferMethod;
  status: TransferStatus;

  offset: number;
  cursor?: string;

  //used for chunk transfer by references
  references?: string[];

  datasetsCount?: number;
  transferedDatasetsCount: number;

  log?: string;
  retryAttempts: number;

  __: TransferReference;
}
