import { Import } from '../../imports/import.type';
import { Transfer } from './transfer.interface';
import { OuterTransferFunction } from './outer-transfer-function.interface';

export interface TransferFailureHandleParams {
  error: Error;
  outerTransferFunction: OuterTransferFunction;
  import?: Import;
  // export?: SqlExport | ApiExport;
  transfer: Transfer;
}
