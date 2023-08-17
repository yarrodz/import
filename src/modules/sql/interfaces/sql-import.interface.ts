import { ProcessType } from '../../processes/process.type.enum';
import { Source } from '../../imports/enums/source.enum';
import ImportField from '../../imports/interfaces/import-field.interface';
import RetryOptions from '../../imports/interfaces/retry-options.interace';
import { SqlImportTarget } from '../enums/sql-import-target.enum';
import ImportReference from '../../imports/interfaces/import-reference.interface';

export default interface SqlImport {
  id: number;

  name: string;
  idKey: string;

  type: ProcessType.IMPORT;
  source: Source.SQL;

  limitRequestsPerSecond: number;
  retryOptions: RetryOptions;

  target: SqlImportTarget;
  table?: string;
  select?: string;
  limit: number;

  fields?: ImportField[];

  __: ImportReference;
}
