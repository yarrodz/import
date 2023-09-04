import ApiImport from '../api/interfaces/api-import.interface';
import EmailImport from '../email/interfaces/email-import.interace';
import SqlImport from '../sql/interfaces/sql-import.interface';

type Import = SqlImport | ApiImport | EmailImport;

export default Import;
