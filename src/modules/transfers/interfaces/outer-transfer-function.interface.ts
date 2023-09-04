import Import from '../../imports/import.type';
import Transfer from './transfer.interface';

export interface OuterTransferFunctionParams {
  import?: Import;
  // export?: SqlExport | ApiExport;
  transfer?: Transfer;
}

export default interface OuterTransferFunction {
  (params: OuterTransferFunctionParams): Promise<void>;
}
