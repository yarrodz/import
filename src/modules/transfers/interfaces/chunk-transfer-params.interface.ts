import { Import } from '../../imports/import.type';
import { Transfer } from './transfer.interface';

export interface ChunkTransferParams {
  import?: Import;
  // export?: SqlExport | ApiExport;
  transfer: Transfer;
  datasets: Object[];
  chunkLength: number;
}
