import { Source } from '../../imports/enums/source.enum';
import { ImportField } from '../../imports/interfaces/import-field.interface';
import { ImportReference } from '../../imports/interfaces/import-reference.interface';
import { RetryOptions } from '../../imports/interfaces/retry-options.interace';
import { ProcessType } from '../../processes/enums/process.type.enum';
import { EmailImportTarget } from '../enums/email-import-target.enum';
import { EmailFilter } from './email-filter.interface';

export interface EmailImport {
  id: number;

  name: string;
  idKey: string;

  type: ProcessType.IMPORT;
  source: Source.EMAIL;

  mailbox: string;
  target: EmailImportTarget;
  filter: Partial<EmailFilter>;

  setSeen: boolean;

  limit: number;

  limitRequestsPerSecond: number;
  retryOptions: RetryOptions;

  fields?: ImportField[];

  __: ImportReference;
}
