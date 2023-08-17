import SqlImport from '../../sql/interfaces/sql-import.interface';
import ApiImport from '../../api/interfaces/api-import.interface';

export default interface TransferReference {
  inImport?: SqlImport | ApiImport;
  inUnit?: any;
}
