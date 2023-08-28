import ApiExport from '../../api/interfaces/api-export.interface';
import ApiImport from '../../api/interfaces/api-import.interface';
import EmailImport from '../../email/interfaces/email-import.interace';
import SqlExport from '../../sql/interfaces/sql-export.interface';
import SqlImport from '../../sql/interfaces/sql-import.interface';
import OuterTransferFunction from './outer-transfer-function.interface';
import Transfer from './transfer.interface';

export default interface TransferFailureHandleParams {
  error: Error;
  outerTransferFunction: OuterTransferFunction;
  import?: SqlImport | ApiImport | EmailImport;
  export?: SqlExport | ApiExport;
  transfer: Transfer;
}
