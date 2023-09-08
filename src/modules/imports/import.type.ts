import { ApiImport } from '../api/interfaces/api-import.interface';
import { EmailImport } from '../email/interfaces/email-import.interace';
import { SqlImport } from '../sql/interfaces/sql-import.interface';

export type Import = SqlImport | ApiImport | EmailImport;
