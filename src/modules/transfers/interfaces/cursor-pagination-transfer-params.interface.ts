import { Import } from '../../imports/import.type';
import { Transfer } from './transfer.interface';
import { CursorPaginationFunction } from './cursor-pagination-function.interface';

export interface CursorPaginationTransferParams {
  import?: Import;
  // export?: SqlExport | ApiExport;
  transfer: Transfer;
  limitPerStep: number;
  paginationFunction: {
    fn: CursorPaginationFunction;
    params: any[];
  };
}
