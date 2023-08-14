import ApiExport from '../../api/interfaces/api-export.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import SqlExport from '../../sql/interfaces/sql-export.interface';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import Transfer from './transfer.interface';

export default interface ChunkTransferParams {
  import?: SqlImport | ApiImport;
  export?: SqlExport | ApiExport;
  transfer: Transfer;
  datasets: Object[];
  chunkLength: number;
}
