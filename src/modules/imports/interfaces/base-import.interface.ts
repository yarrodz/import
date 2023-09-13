import { Source } from 'mailparser';
import { RetryOptions } from './retry-options.interace';
import { ImportReference } from './import-reference.interface';

export interface BaseImport {
  id: number;

  name: string;
  source: Source;

  limitRequestsPerSecond: number;
  retryOptions: RetryOptions;

  __: ImportReference;
}
