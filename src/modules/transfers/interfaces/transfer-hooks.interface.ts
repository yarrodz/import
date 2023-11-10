import { TransferHook } from './transfer-hook.interface';

export interface TransferHooks {
  afterFetch: TransferHook[];
  afterTransform: TransferHook[];
  afterSave: TransferHook[];
}
