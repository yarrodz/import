import { Import } from '../../imports/import.type';
import { Transfer } from './transfer.interface';
import { OffsetPaginationFunction } from './offset-pagination-function.interface';

export interface OffsetPaginationTransferParams {
  import?: Import;
  // export?: SqlExport | ApiExport;
  transfer: Transfer;
  limitPerStep: number;
  paginationFunction: {
    fn: OffsetPaginationFunction;
    params: any[];
  };
}
