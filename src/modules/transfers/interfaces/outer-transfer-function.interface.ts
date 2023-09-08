import { Import } from '../../imports/import.type';
import { Transfer } from './transfer.interface';

export interface OuterTransferFunctionParams {
  import?: Import;
  // export?: SqlExport | ApiExport;
  transfer?: Transfer;
}

export interface OuterTransferFunction {
  (params: OuterTransferFunctionParams): Promise<void>;
}
