import { TransferRetryOptions } from './transfer-retry-options.interace';
import { TransferReference } from './transfer-reference.interface';

export interface Transfer {
  id: number;

  name: string;

  source: string;

  fields: any;

  retryOptions: TransferRetryOptions;

  __: TransferReference;
}
