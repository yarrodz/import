import ApiExport from '../../api/interfaces/api-export.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import EmailImport from '../../email/interfaces/email-import.interace';
import SqlExport from '../../sql/interfaces/sql-export.interface';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import OffsetPaginationFunction from './offset-pagination-function.interface';
import Transfer from './transfer.interface';

export default interface OffsetPaginationTransferParams {
  import?: SqlImport | ApiImport | EmailImport;
  export?: SqlExport | ApiExport;
  transfer: Transfer;
  limitPerStep: number;
  paginationFunction: {
    fn: OffsetPaginationFunction;
    params: any[];
  };
}
